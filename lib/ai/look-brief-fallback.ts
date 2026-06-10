import { buildCelebritySearchPlan } from "@/lib/ai/celebrity-queries";
import { APP_MARKET } from "@/lib/market";
import { lookBriefSchema } from "@/lib/ai/schema";
import type { AiLookBrief, LookBriefInput } from "@/lib/ai/types";

export function buildFallbackLookBrief(input: LookBriefInput): AiLookBrief {
  const en = (input.locale ?? APP_MARKET.locale) === "en-US";
  const celebrity = buildCelebritySearchPlan(input.prompt, input.locale);
  const firstArticle = input.articles[0];

  if (celebrity) {
    return lookBriefSchema.parse({
      headline:
        firstArticle?.title.slice(0, 80) ?? celebrity.summary.slice(0, 80),
      whereFrom: en
        ? /paris|fashion\s*week|collection/i.test(input.prompt)
          ? "Paris Fashion Week or similar global runway moment"
          : /stage|concert/i.test(input.prompt)
            ? "Stage / performance"
            : "Recent celebrity fashion moment"
        : /파리|패션\s*위크|컬렉션/.test(input.prompt)
          ? "파리·패션위크 등 해외 패션 행사"
          : /무대|콘서트/.test(input.prompt)
            ? "무대·퍼포먼스"
            : "최근 셀럽 패션 이슈",
      brandOrItem:
        celebrity.searches[0]?.query ??
        (en ? "Editor-estimated look" : "에디터 추정 착장"),
      priceNote: en
        ? "Runway and celebrity pieces may not have public retail prices. Similar items below are shoppable references."
        : "런웨이·셀럽 착장 본품 가격은 기사·브랜드 공개에 따릅니다. 아래는 유사 쇼핑품 기준입니다.",
      editorialSummary:
        input.planSummary ||
        celebrity.summary ||
        (en
          ? "We gathered similar shoppable items using related coverage and shopping search."
          : "관련 기사와 쇼핑 검색을 바탕으로 유사 아이템을 모았습니다."),
    });
  }

  return lookBriefSchema.parse({
    headline: firstArticle?.title.slice(0, 80) ?? input.prompt.slice(0, 80),
    whereFrom: en ? "Your fashion request" : "요청하신 패션 키워드",
    brandOrItem: input.prompt.slice(0, 60),
    priceNote: en
      ? "Exact retail prices may vary by source."
      : "정확한 공식 가격은 출처별로 다를 수 있습니다.",
    editorialSummary:
      input.planSummary ||
      (firstArticle
        ? en
          ? `Using coverage such as "${firstArticle.title.slice(0, 48)}…" as context, we picked similar shoppable items.`
          : `${firstArticle.title} 등 관련 콘텐츠를 참고해 유사 쇼핑 아이템을 골랐습니다.`
        : en
          ? "Picked items from shopping search that match your request."
          : "쇼핑 검색 결과에서 조건에 맞는 아이템을 골랐습니다."),
  });
}
