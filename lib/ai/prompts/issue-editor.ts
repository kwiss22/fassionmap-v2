import type { CurationInput } from "@/lib/ai/types";

type PromptMessage = {
  role: "system" | "user";
  content: string;
};

function compactProducts(input: CurationInput): string {
  return input.candidateProducts
    .slice(0, 12)
    .map((p, idx) => {
      return `${idx + 1}. ${p.name} | mall=${p.mallName ?? p.mall} | price=${p.price} | category2=${p.category2 ?? "-"}`;
    })
    .join("\n");
}

export function buildIssueEditorPrompt(input: CurationInput): PromptMessage[] {
  const maxSections = Math.max(1, input.maxSections ?? 3);
  const trendSignals =
    input.trendSignals.length > 0
      ? input.trendSignals.join(", ")
      : "에디터 추천";

  const system = [
    "You are an editorial fashion curator for Fassionmap.",
    "Return ONLY valid JSON that matches the IssueDraft schema.",
    "Do not wrap output in markdown fences.",
    "Keep section count exactly equal to maxSections.",
    "Use concise, magazine-style copy.",
  ].join(" ");

  const user = [
    `locale: ${input.locale ?? "ko-KR"}`,
    `issueMeta: vol=${input.issueMeta.vol}, season=${input.issueMeta.season}, date=${input.issueMeta.date}, city=${input.issueMeta.city}`,
    `trendSignals: ${trendSignals}`,
    `maxSections: ${maxSections}`,
    "",
    "candidateProducts:",
    compactProducts(input),
    "",
    "Requirements:",
    "- sections[0] should be a brand-focused section when possible.",
    "- Every section must include id, eyebrow, title, source, size.",
    "- source.type must be one of: brand, theme, saved-ai.",
    "- tickerItems should contain 3 short items.",
    "- URLs can be internal paths (e.g. /feed, /saved?tab=looks).",
  ].join("\n");

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}
