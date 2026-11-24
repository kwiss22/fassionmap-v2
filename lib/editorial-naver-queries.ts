import { resolveBrandQuery, type EditorialSection } from "@/lib/editorial";

/** theme 섹션 id → 쇼핑 검색어 (AliExpress는 영어 키워드 기준이라 영어 우선) */
export const THEME_NAVER_QUERY_FALLBACKS: Record<string, readonly string[]> = {
  "theme-cashmere": ["cashmere coat", "cashmere sweater"],
};

export function resolveNaverQueriesForSection(
  section: EditorialSection
): string[] {
  switch (section.source.type) {
    case "theme": {
      const primary = section.source.query.trim();
      const fallbacks = THEME_NAVER_QUERY_FALLBACKS[section.id] ?? [];
      return [...new Set([...fallbacks, primary].filter(Boolean))];
    }
    case "brand": {
      const base = resolveBrandQuery(section.source.brandSlug);
      const q = section.source.category
        ? `${base} ${section.source.category}`
        : base;
      return [q];
    }
    case "saved-ai":
      return ["cashmere sweater", "women's coat"];
  }
}
