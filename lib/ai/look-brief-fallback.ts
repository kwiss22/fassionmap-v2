import { buildCelebritySearchPlan } from "@/lib/ai/celebrity-queries";
import { lookBriefSchema } from "@/lib/ai/schema";
import type { AiLookBrief, LookBriefInput } from "@/lib/ai/types";

export function buildFallbackLookBrief(input: LookBriefInput): AiLookBrief {
  const celebrity = buildCelebritySearchPlan(input.prompt);
  const firstArticle = input.articles[0];

  if (celebrity) {
    return lookBriefSchema.parse({
      headline:
        firstArticle?.title.slice(0, 80) ?? celebrity.summary.slice(0, 80),
      whereFrom: /파리|패션\s*위크|컬렉션/.test(input.prompt)
        ? "파리·패션위크 등 해외 패션 행사"
        : /무대|콘서트/.test(input.prompt)
          ? "무대·퍼포먼스"
          : "최근 셀럽 패션 이슈",
      brandOrItem: celebrity.searches[0]?.query ?? "에디터 추정 착장",
      priceNote:
        "런웨이·셀럽 착장 본품 가격은 기사·브랜드 공개에 따릅니다. 아래는 유사 쇼핑품 기준입니다.",
      editorialSummary:
        input.planSummary ||
        celebrity.summary ||
        "관련 기사와 쇼핑 검색을 바탕으로 유사 아이템을 모았습니다.",
    });
  }

  return lookBriefSchema.parse({
    headline: firstArticle?.title.slice(0, 80) ?? input.prompt.slice(0, 80),
    whereFrom: "요청하신 패션 키워드",
    brandOrItem: input.prompt.slice(0, 60),
    priceNote: "정확한 공식 가격은 출처별로 다를 수 있습니다.",
    editorialSummary:
      input.planSummary ||
      (firstArticle
        ? `${firstArticle.title} 등 관련 콘텐츠를 참고해 유사 쇼핑 아이템을 골랐습니다.`
        : "쇼핑 검색 결과에서 조건에 맞는 아이템을 골랐습니다."),
  });
}
