import { getCityBySlug } from "@/lib/cities";
import { CURRENT_ISSUE, resolveBrandQuery } from "@/lib/editorial";

/**
 * Atlas 패널 «View … Edit» 목적지.
 * - 홈 이슈에 해당 도시 소속 브랜드 스포트라이트 섹션이 있으면 `#section.id` (인페이지 스크롤)
 * - 없으면 대표 브랜드 검색으로 이동
 */
export function getAtlasCityCtaHref(citySlug: string): string {
  const city = getCityBySlug(citySlug);
  if (!city) return "/search";

  const inCity = new Set(city.brandSlugs);
  for (const sec of CURRENT_ISSUE.sections) {
    if (sec.source.type === "brand" && inCity.has(sec.source.brandSlug)) {
      return `#${sec.id}`;
    }
  }

  const q = resolveBrandQuery(city.brandSlugs[0] ?? "패션");
  return `/search?q=${encodeURIComponent(q)}`;
}
