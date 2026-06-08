import { getLLMProvider } from "@/lib/ai/client";
import { buildFallbackLookBrief } from "@/lib/ai/look-brief-fallback";
import { lookBriefSchema } from "@/lib/ai/schema";import type {
  AiLookBrief,
  AiSearchCuratedItem,
  GenerateIssueOptions,
  LLMProvider,
  LookBriefInput,
} from "@/lib/ai/types";

const DEFAULT_MAX_OUTPUT_TOKENS = 512;

function formatKrw(amount: number): string {
  if (amount >= 10_000) {
    return `${Math.round(amount / 10_000)}만 원`;
  }
  return `${amount.toLocaleString("ko-KR")}원`;
}

export function buildShoppingPriceRange(
  items: AiSearchCuratedItem[]
): string | undefined {
  if (items.length === 0) return undefined;
  const prices = items.map((i) => i.product.price).filter((p) => p > 0);
  if (prices.length === 0) return undefined;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) {
    return `유사 쇼핑 상품 약 ${formatKrw(min)}`;
  }
  return `유사 쇼핑 상품 약 ${formatKrw(min)}~${formatKrw(max)}`;
}

export async function resolveLookBrief(  input: LookBriefInput,
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
  items: AiSearchCuratedItem[]
): AiLookBrief {
  const shoppingPriceRange = buildShoppingPriceRange(items);
  if (!shoppingPriceRange) return brief;
  return { ...brief, shoppingPriceRange };
}
