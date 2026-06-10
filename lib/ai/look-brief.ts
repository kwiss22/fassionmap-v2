import { getLLMProvider } from "@/lib/ai/client";
import { buildFallbackLookBrief } from "@/lib/ai/look-brief-fallback";
import { lookBriefSchema } from "@/lib/ai/schema";
import { APP_MARKET } from "@/lib/market";
import type { ProductSource } from "@/lib/product";
import type {
  AiLookBrief,
  AiSearchCuratedItem,
  GenerateIssueOptions,
  LLMProvider,
  LookBriefInput,
} from "@/lib/ai/types";

const DEFAULT_MAX_OUTPUT_TOKENS = 512;

function formatPrice(
  amount: number,
  locale?: string,
  source: ProductSource = "naver"
): string {
  const en = (locale ?? APP_MARKET.locale) === "en-US";
  if (en && source === "aliexpress") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  }
  if (en) {
    return `₩${amount.toLocaleString("en-US")}`;
  }
  if (amount >= 10_000) {
    return `${Math.round(amount / 10_000)}만 원`;
  }
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function buildShoppingPriceRange(
  items: AiSearchCuratedItem[],
  locale?: string
): string | undefined {
  if (items.length === 0) return undefined;
  const prices = items.map((i) => i.product.price).filter((p) => p > 0);
  if (prices.length === 0) return undefined;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const en = (locale ?? APP_MARKET.locale) === "en-US";
  const source =
    items.find((i) => i.product.source === "aliexpress")?.product.source ??
    items[0]?.product.source ??
    "naver";
  const prefix = en
    ? source === "aliexpress"
      ? "Similar items around"
      : "Similar K-Fashion items around"
    : "유사 쇼핑 상품 약";
  if (min === max) {
    return `${prefix} ${formatPrice(min, locale, source)}`;
  }
  return `${prefix} ${formatPrice(min, locale, source)}–${formatPrice(max, locale, source)}`;
}

export async function resolveLookBrief(
  input: LookBriefInput,
  options: { provider?: LLMProvider; maxOutputTokens?: number } = {}
): Promise<AiLookBrief> {
  const provider = options.provider ?? getLLMProvider();
  const providerOptions: GenerateIssueOptions = {
    maxOutputTokens: options.maxOutputTokens ?? DEFAULT_MAX_OUTPUT_TOKENS,
    temperature: 0.3,
  };

  try {
    const brief = await provider.generateLookBrief(input, providerOptions);
    return lookBriefSchema.parse(brief);
  } catch {
    return buildFallbackLookBrief(input);
  }
}

export function enrichLookBriefWithShopping(
  brief: AiLookBrief,
  items: AiSearchCuratedItem[],
  locale?: string
): AiLookBrief {
  const shoppingPriceRange = buildShoppingPriceRange(items, locale);
  if (!shoppingPriceRange) return brief;
  return { ...brief, shoppingPriceRange };
}
