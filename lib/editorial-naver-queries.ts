import { resolveBrandQuery, type EditorialSection } from "@/lib/editorial";

/** theme 섹션 id → 네이버 쇼핑 검색어 (한국어 우선) */
export const THEME_NAVER_QUERY_FALLBACKS: Record<string, readonly string[]> = {
  "theme-cashmere": ["캐시미어 코트", "캐시미어 니트", "cashmere coat"],
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
      return ["캐시미어 니트", "여성 코트"];
  }
}
