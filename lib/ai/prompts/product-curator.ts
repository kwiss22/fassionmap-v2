import type { AiSearchInput } from "@/lib/ai/types";

type PromptMessage = {
  role: "system" | "user";
  content: string;
};

export function buildProductCuratorPrompt(input: AiSearchInput): PromptMessage[] {
  const system = [
    "You are a fashion shopping curator for Fassionmap (Korean luxury/editorial tone).",
    "The user describes what they want in natural language.",
    "Return ONLY valid JSON matching the AiSearchPlan schema.",
    "Do not wrap output in markdown fences.",
    "Do not invent product URLs, prices, or mall names — only output search queries and pick ranks.",
    "searchIndex refers to the index in the searches array (0-based).",
    "rank refers to the expected position in Naver Shopping results for that query (0 = top result).",
    "Use Korean for summary, intent, and reason fields unless locale is en-US.",
    "Keep searches to 1–3 focused Naver Shopping queries (brand + item + style keywords).",
    "Keep picks to 4–8 items total, spread across searches when possible.",
    "reason: one short sentence why this pick fits the user's request.",
    "CELEBRITY / EVENT OUTFIT requests (e.g. Jennie Paris fashion week, idol stage outfit, airport look):",
    "- NEVER use the raw sentence as a single Naver query (e.g. avoid '제니 파리 컬렉션 의상').",
    "- Infer likely brands, garment types, colors, and event context from public fashion knowledge.",
    "- searches must be concrete product queries Naver Shopping can return: '제니 샤넬', '제니 코디', '여성 트위드 재킷', '블랙 미니드레스 여성'.",
    "- summary should mention the celebrity/event and what similar shoppable items you targeted.",
    "- reason should tie each pick to the celebrity look (silhouette, brand tone, color).",
  ].join(" ");

  const user = [
    `locale: ${input.locale ?? "ko-KR"}`,
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
