import { APP_MARKET } from "@/lib/market";
import type { AiSearchInput } from "@/lib/ai/types";

type PromptMessage = {
  role: "system" | "user";
  content: string;
};

export function buildProductCuratorPrompt(input: AiSearchInput): PromptMessage[] {
  const locale = input.locale ?? APP_MARKET.locale;
  const en = locale === "en-US";

  const system = [
    "You are a fashion shopping curator for Fashionmap (editorial luxury-commerce tone).",
    "The user describes what they want in natural language.",
    "Return ONLY valid JSON matching the AiSearchPlan schema.",
    "Do not wrap output in markdown fences.",
    "Do not invent product URLs, prices, or mall names — only output search queries and pick ranks.",
    "searchIndex refers to the index in the searches array (0-based).",
    "rank refers to the expected position in shopping results for that query (0 = top result).",
    en
      ? "Use English for summary, intent, and reason fields."
      : "Use Korean for summary, intent, and reason fields.",
    "Keep searches to 1–3 focused shopping queries (brand + item + style keywords).",
    en
      ? "For en-US: prefer English queries that still work on Asian fashion marketplaces (e.g. 'Jennie Chanel', 'women tweed jacket', 'korean streetwear women')."
      : "For ko-KR: use Korean Naver Shopping queries.",
    "Keep picks to 4–8 items total, spread across searches when possible.",
    "reason: one short sentence why this pick fits the user's request.",
    "CELEBRITY / EVENT OUTFIT requests (e.g. Jennie Paris fashion week, idol stage outfit, airport look):",
    en
      ? "- NEVER paste the raw user sentence as a single query."
      : "- NEVER use the raw sentence as a single Naver query (e.g. avoid '제니 파리 컬렉션 의상').",
    "- Infer likely brands, garment types, colors, and event context from public fashion knowledge.",
    en
      ? "- searches must be concrete: 'Jennie Chanel style', 'women tweed jacket', 'black mini dress women'."
      : "- searches must be concrete product queries: '제니 샤넬', '제니 코디', '여성 트위드 재킷'.",
    "- summary should mention the celebrity/event and what similar shoppable items you targeted.",
    "- reason should tie each pick to the celebrity look (silhouette, brand tone, color).",
  ].join(" ");

  const user = [
    `locale: ${locale}`,
    `userPrompt: ${input.prompt}`,
    "",
    "Output shape:",
    "- summary: 1–2 sentences editor tone, what you looked for",
    "- searches: [{ query, intent? }]",
    "- picks: [{ searchIndex, rank, reason }]",
  ].join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
