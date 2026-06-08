import { buildCelebritySearchPlan } from "@/lib/ai/celebrity-queries";
import { buildFallbackLookBrief } from "@/lib/ai/look-brief-fallback";
import type {
  AiSearchInput,
  AiSearchPlan,
  IssueDraft,
  LLMProvider,
  LookBriefInput,
} from "@/lib/ai/types";
import { aiSearchPlanSchema, issueDraftSchema, lookBriefSchema } from "@/lib/ai/schema";
function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, " ")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function pickBrandSlugFromProducts(
  candidateProducts: { name: string; mallName?: string }[]
): string {
  for (const product of candidateProducts) {
    const fromName = toSlug(product.name.split(" ").slice(0, 2).join(" "));
    if (fromName) return fromName;

    const fromMall = toSlug(product.mallName ?? "");
    if (fromMall) return fromMall;
  }
  return "editor-pick";
}

export class MockProvider implements LLMProvider {
  readonly name = "mock" as const;

  async generateIssueDraft(
    input: Parameters<LLMProvider["generateIssueDraft"]>[0],
    _options: Parameters<LLMProvider["generateIssueDraft"]>[1]
  ): Promise<IssueDraft> {
    const maxSections = Math.max(1, input.maxSections ?? 3);
    const brandSlug = pickBrandSlugFromProducts(input.candidateProducts);
    const trendSignals = input.trendSignals.length > 0 ? input.trendSignals : ["에디터 추천"];

    const sections: IssueDraft["sections"] = Array.from(
      { length: maxSections },
      (_, index) => {
        if (index === 0) {
          return {
            id: `mock-brand-${index + 1}`,
            eyebrow: "MOCK CURATION",
            title: "Brand spotlight",
            titleHighlight: brandSlug,
            subtitle: "candidateProducts 기반 브랜드 섹션",
            source: { type: "brand", brandSlug },
            size: 6,
          };
        }

        const signal = trendSignals[(index - 1) % trendSignals.length];
        return {
          id: `mock-theme-${index + 1}`,
          eyebrow: `MOCK EDIT ${index}`,
          title: `${signal} edit`,
          subtitle: "trendSignals 기반 테마 섹션",
          source: { type: "theme", query: signal, size: 6 },
          size: 6,
        };
      }
    );

    const draft: IssueDraft = {
      vol: input.issueMeta.vol,
      season: input.issueMeta.season,
      title: `Mock issue for ${input.issueMeta.city}`,
      titleHighlight: "mock",
      dek: `${input.issueMeta.city} 기준 결정론적 mock issue draft`,
      date: input.issueMeta.date,
      city: input.issueMeta.city,
      coverLabel: "MOCK COVER",
      coverImage:
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=85&w=1800",
      coverAlt: "Mock editorial cover image",
      coverFocal: "center 35%",
      primaryCtaLabel: "COLLECTION 보기",
      primaryCtaHref: "/feed",
      secondaryCtaLabel: "LOOKBOOK",
      secondaryCtaHref: "/saved?tab=looks",
      tickerItems: [
        `VOL ${input.issueMeta.vol}`,
        input.issueMeta.season,
        input.issueMeta.city,
      ],
      sections,
    };

    return issueDraftSchema.parse(draft);
  }

  async generateAiSearchPlan(
    input: AiSearchInput,
    _options: Parameters<LLMProvider["generateAiSearchPlan"]>[1]
  ): Promise<AiSearchPlan> {
    const prompt = input.prompt.trim() || "에디터 추천";
    const celebrityPlan = buildCelebritySearchPlan(prompt);
    if (celebrityPlan) {
      return aiSearchPlanSchema.parse(celebrityPlan);
    }

    const words = prompt.split(/\s+/).filter(Boolean);
    const q1 = words.slice(0, 4).join(" ") || prompt;
    const q2 = words.length > 2 ? `${words[0]} ${words[1]} 추천` : `${prompt} 코디`;

    const plan: AiSearchPlan = {
      summary: `MOCK: "${prompt}"에 맞춰 ${q1}·${q2} 검색으로 골랐습니다.`,
      searches: [
        { query: q1, intent: "핵심 키워드 검색" },
        { query: q2, intent: "보조 스타일 검색" },
      ],
      picks: [
        { searchIndex: 0, rank: 0, reason: "첫 검색 상위 — 톤·실루엣이 요청과 가깝습니다." },
        { searchIndex: 0, rank: 1, reason: "가격·브랜드 밸런스가 좋은 대안입니다." },
        { searchIndex: 1, rank: 0, reason: "두 번째 검색에서 코디에 쓰기 좋은 피스입니다." },
        { searchIndex: 1, rank: 1, reason: "같은 무드의 추가 옵션입니다." },
      ],
    };

    return aiSearchPlanSchema.parse(plan);
  }

  async generateLookBrief(
    input: LookBriefInput,
    _options: Parameters<LLMProvider["generateLookBrief"]>[1]
  ) {
    return lookBriefSchema.parse(buildFallbackLookBrief(input));
  }
}