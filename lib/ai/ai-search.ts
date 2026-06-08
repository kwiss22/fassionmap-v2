import { fetchNaverProductsPage } from "@/lib/api";
import {
  buildCelebritySearchPlan,
  buildContentSearchQuery,
  isCelebrityStylePrompt,
} from "@/lib/ai/celebrity-queries";
import { getLLMProvider } from "@/lib/ai/client";
import { getCachedAiSearch, setCachedAiSearch } from "@/lib/ai/cache";
import {
  enrichLookBriefWithShopping,
  resolveLookBrief,
} from "@/lib/ai/look-brief";
import { buildProductCuratorPrompt } from "@/lib/ai/prompts/product-curator";
import { aiSearchPlanSchema } from "@/lib/ai/schema";
import type {
  AiContentArticle,
  AiSearchInput,
  AiSearchPlan,
  AiSearchResult,
  GenerateIssueOptions,
  LLMProvider,
} from "@/lib/ai/types";
import { fetchRelatedContent } from "@/lib/naver-content";
import { productDedupeKey, type Product } from "@/lib/product";

const DEFAULT_MAX_OUTPUT_TOKENS = 768;
const DEFAULT_RETRY_COUNT = 1;
const PRODUCTS_PER_QUERY = 12;

type CurateAiSearchOptions = Partial<GenerateIssueOptions> & {
  provider?: LLMProvider;
  retryCount?: number;
  useCache?: boolean;
};

function buildFallbackPlan(prompt: string): AiSearchPlan {
  const celebrityPlan = buildCelebritySearchPlan(prompt);
  if (celebrityPlan) {
    return celebrityPlan;
  }

  const trimmed = prompt.trim().slice(0, 60) || "패션 추천";
  const words = trimmed.split(/\s+/).filter(Boolean);
  const q1 = words.slice(0, 3).join(" ") || trimmed;

  return {
    summary: `"${trimmed}"에 맞춰 쇼핑 가능한 키워드로 나눠 골랐습니다.`,
    searches: [
      { query: `${q1} 코디`, intent: "fallback" },
      { query: "여성 블레이저", intent: "fallback 보조" },
    ],
    picks: [
      { searchIndex: 0, rank: 0, reason: "첫 검색 상위 — 요청 키워드와 가깝습니다." },
      { searchIndex: 0, rank: 1, reason: "같은 검색의 대안 피스입니다." },
      { searchIndex: 1, rank: 0, reason: "보조 검색에서 고른 에디터 픽입니다." },
      { searchIndex: 1, rank: 1, reason: "스타일을 넓혀 볼 수 있는 옵션입니다." },
    ],
  };
}

async function resolvePlan(
  input: AiSearchInput,
  options: CurateAiSearchOptions
): Promise<AiSearchPlan> {
  const provider = options.provider ?? getLLMProvider();
  const retryCount = Math.max(0, options.retryCount ?? DEFAULT_RETRY_COUNT);
  const providerOptions: GenerateIssueOptions = {
    maxOutputTokens: options.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
    temperature: options.temperature ?? 0.35,
  };

  void buildProductCuratorPrompt(input);

  let lastError: unknown = null;
  for (let attempt = 0; attempt <= retryCount; attempt += 1) {
    try {
      const plan = await provider.generateAiSearchPlan(input, providerOptions);
      const parsed = aiSearchPlanSchema.parse(plan);
      if (isCelebrityStylePrompt(input.prompt)) {
        return mergeCelebrityPlan(input.prompt, parsed);
      }
      return parsed;
    } catch (error) {
      lastError = error;
    }
  }

  void lastError;
  const fallback = buildFallbackPlan(input.prompt);
  return aiSearchPlanSchema.parse(fallback);
}

function mergeCelebrityPlan(
  prompt: string,
  llmPlan: AiSearchPlan
): AiSearchPlan {
  const expanded = buildCelebritySearchPlan(prompt);
  if (!expanded) return llmPlan;

  const vagueOnly = llmPlan.searches.every(
    (s) =>
      s.query.includes(prompt.trim()) ||
      /컬렉션\s*의상|파리\s*컬렉션|최근\s*입은\s*옷/.test(s.query)
  );
  if (!vagueOnly && llmPlan.searches.length >= 2) {
    return llmPlan;
  }

  const seen = new Set(llmPlan.searches.map((s) => s.query));
  const searches = [...llmPlan.searches];
  for (const s of expanded.searches) {
    if (searches.length >= 3) break;
    if (seen.has(s.query)) continue;
    seen.add(s.query);
    searches.push(s);
  }

  return {
    summary: expanded.summary || llmPlan.summary,
    searches: searches.slice(0, 3),
    picks:
      llmPlan.picks.length >= 4
        ? llmPlan.picks
        : expanded.picks.slice(0, 8),
  };
}

async function fetchRelatedArticles(prompt: string): Promise<AiContentArticle[]> {
  const query = buildContentSearchQuery(prompt);
  const items = await fetchRelatedContent(query);
  return items.map((item) => ({
    title: item.title,
    description: item.description,
    link: item.link,
    source: item.source,
    pubDate: item.pubDate,
  }));
}

async function fetchPools(plan: AiSearchPlan): Promise<Product[][]> {
  const pools: Product[][] = [];
  for (const search of plan.searches) {
    const page = await fetchNaverProductsPage(search.query, {
      start: 1,
      display: PRODUCTS_PER_QUERY,
      sort: "sim",
    });
    pools.push(page.items);
  }
  return pools;
}

function pickFromPool(pool: Product[], rank: number): Product | undefined {
  for (let r = rank; r < pool.length && r < rank + 4; r += 1) {
    if (pool[r]) return pool[r];
  }
  return undefined;
}

function materializePicks(
  plan: AiSearchPlan,
  pools: Product[][],
  defaultReason?: string
): AiSearchResult["items"] {
  const seen = new Set<string>();
  const items: AiSearchResult["items"] = [];

  for (const pick of plan.picks) {
    const pool = pools[pick.searchIndex];
    if (!pool?.length) continue;
    const product = pickFromPool(pool, pick.rank);
    if (!product) continue;
    const key = productDedupeKey(product);
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({
      product,
      reason: pick.reason || defaultReason || "큐레이션 조건에 맞는 상품입니다.",
    });
  }

  return items;
}

function backfillFromPools(
  plan: AiSearchPlan,
  pools: Product[][],
  existing: AiSearchResult["items"],
  target = 4
): AiSearchResult["items"] {
  const seen = new Set(existing.map((e) => productDedupeKey(e.product)));
  const items = [...existing];
  const fallbackReason =
    plan.summary.length > 0
      ? `${plan.summary.slice(0, 80)}…와 비슷한 쇼핑 아이템입니다.`
      : "검색 상위 결과에서 고른 유사 아이템입니다.";

  for (let si = 0; si < pools.length && items.length < target; si += 1) {
    const pool = pools[si];
    const intent = plan.searches[si]?.intent;
    for (let rank = 0; rank < pool.length && items.length < target; rank += 1) {
      const product = pool[rank];
      if (!product) continue;
      const key = productDedupeKey(product);
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        product,
        reason: intent
          ? `${intent} — 쇼핑 검색 상위 픽입니다.`
          : fallbackReason,
      });
    }
  }

  return items;
}

export async function curateAiSearch(
  input: AiSearchInput,
  options: CurateAiSearchOptions = {}
): Promise<AiSearchResult> {
  const useCache = options.useCache !== false;
  if (useCache) {
    const cached = getCachedAiSearch(input);
    if (cached) return cached;
  }

  const provider = options.provider ?? getLLMProvider();

  const [plan, articles] = await Promise.all([
    resolvePlan(input, options),
    fetchRelatedArticles(input.prompt),
  ]);

  let lookBrief = await resolveLookBrief(
    {
      prompt: input.prompt,
      articles,
      planSummary: plan.summary,
      locale: input.locale,
    },
    { provider }
  );

  let pools = await fetchPools(plan);
  let items = materializePicks(plan, pools);

  if (items.length === 0 && isCelebrityStylePrompt(input.prompt)) {
    const celebrityPlan = buildCelebritySearchPlan(input.prompt);
    if (celebrityPlan) {
      const replan = aiSearchPlanSchema.parse(celebrityPlan);
      pools = await fetchPools(replan);
      items = materializePicks(replan, pools);
    }
  }

  if (items.length < 4) {
    items = backfillFromPools(plan, pools, items, 6);
  }

  lookBrief = enrichLookBriefWithShopping(lookBrief, items);

  const result: AiSearchResult = {
    summary: lookBrief.editorialSummary,
    lookBrief,
    articles,
    items,
    provider: provider.name,
  };

  if (useCache && (result.items.length > 0 || result.articles.length > 0)) {
    setCachedAiSearch(input, result);
  }

  return result;
}
