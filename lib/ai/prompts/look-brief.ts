import type { LookBriefInput } from "@/lib/ai/types";

type PromptMessage = {
  role: "system" | "user";
  content: string;
};

function compactArticles(input: LookBriefInput): string {
  if (input.articles.length === 0) {
    return "(no articles — infer cautiously from user prompt only)";
  }
  return input.articles
    .slice(0, 6)
    .map((a, i) => {
      return `${i + 1}. [${a.source}] ${a.title}\n   ${a.description.slice(0, 160)}`;
    })
    .join("\n");
}

export function buildLookBriefPrompt(input: LookBriefInput): PromptMessage[] {
  const system = [
    "You write a short Korean fashion editor brief for Fassionmap AI search.",
    "Return ONLY valid JSON matching LookBrief schema.",
    "Do not invent specific article URLs — use article snippets only for factual tone.",
    "whereFrom: event/venue/show (e.g. 파리 패션위크, 공항, 콘서트 무대).",
    "brandOrItem: likely brand + garment type.",
    "priceNote: runway/official price if known from snippets, else say 공개 전 or 추정.",
    "If unknown, say clearly that exact retail price is not confirmed.",
    "editorialSummary: 2-3 sentences connecting look context to shoppable similar items.",
    "Do not wrap in markdown fences.",
  ].join(" ");

  const user = [
    `locale: ${input.locale ?? "ko-KR"}`,
    `userPrompt: ${input.prompt}`,
    input.planSummary ? `curationHint: ${input.planSummary}` : "",
    "",
    "relatedArticles:",
    compactArticles(input),
    "",
    "Output: headline, whereFrom, brandOrItem, priceNote, editorialSummary",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
