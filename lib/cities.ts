/**
 * Atlas 시그니처 섹션용 도시 메타.
 *
 * - 좌표는 [longitude, latitude] (d3-geo의 GeoJSON 표준).
 * - `brandSlugs`는 그 도시를 본거지로 보는 큐레이션 브랜드들.
 *   Wooyoungmi/Juun.J처럼 한국 디자이너지만 파리 컬렉션 베이스인 경우는
 *   "패션의 발신지"라는 매거진 관점으로 파리에 둔다.
 * - `intro`는 사이드 패널에 보일 짧은 에디터 문구.
 */

export type City = {
  slug: string;
  displayName: string;
  displayKo: string;
  country: string;
  coords: [number, number];
  intro: string;
  brandSlugs: readonly string[];
};

export const CITIES: readonly City[] = [
  {
    slug: "paris",
    displayName: "Paris",
    displayKo: "파리",
    country: "FR",
    coords: [2.3522, 48.8566],
    intro:
      "에르메스, 셀린느, 발렌시아가, 메종 마르지엘라… 파리는 여전히 quiet luxury의 본거지다.",
    brandSlugs: [
      "hermes",
      "celine",
      "louis-vuitton",
      "chanel",
      "dior",
      "dior-homme",
      "balenciaga",
      "saint-laurent",
      "lemaire",
      "chloe",
      "ami-paris",
      "jacquemus",
      "maison-margiela",
      "wooyoungmi",
      "juun-j",
    ],
  },
  {
    slug: "milan",
    displayName: "Milan",
    displayKo: "밀라노",
    country: "IT",
    coords: [9.19, 45.4642],
    intro:
      "프라다, 구찌, 보테가 베네타. 이탈리아 장인 정신이 가장 모던한 형태로 살아 있는 곳.",
    brandSlugs: [
      "prada",
      "gucci",
      "bottega-veneta",
      "valentino",
      "ferragamo",
      "miu-miu",
      "armani",
      "etro",
      "marni",
      "moncler",
      "tods",
    ],
  },
  {
    slug: "london",
    displayName: "London",
    displayKo: "런던",
    country: "GB",
    coords: [-0.1276, 51.5074],
    intro:
      "버버리의 클래식부터 알렉산더 맥퀸의 다크 로맨티시즘까지, 런던 특유의 sharpness.",
    brandSlugs: ["burberry", "alexander-mcqueen", "palace"],
  },
  {
    slug: "new-york",
    displayName: "New York",
    displayKo: "뉴욕",
    country: "US",
    coords: [-74.006, 40.7128],
    intro:
      "랄프 로렌의 아메리칸 헤리티지, 톰 포드의 글래머, 톰 브라운의 격식. 도시 전체가 옷장.",
    brandSlugs: [
      "polo-ralph-lauren",
      "calvin-klein",
      "coach",
      "tory-burch",
      "marc-jacobs",
      "tommy-hilfiger",
      "supreme",
      "tom-ford",
      "thom-browne",
    ],
  },
  {
    slug: "tokyo",
    displayName: "Tokyo",
    displayKo: "도쿄",
    country: "JP",
    coords: [139.6917, 35.6895],
    intro:
      "꼼데가르송, 이세이 미야케, 비즈빔. 옷에 대해 가장 깊게 사고하는 도시.",
    brandSlugs: [
      "comme-des-garcons",
      "issey-miyake",
      "kapital",
      "orslow",
      "yohji-yamamoto",
      "visvim",
    ],
  },
  {
    slug: "seoul",
    displayName: "Seoul",
    displayKo: "서울",
    country: "KR",
    coords: [126.978, 37.5665],
    intro:
      "마뗑킴, 아더에러, 시스템. 컨템포러리의 새로운 진앙. 글로벌 메종 옆에 나란히 두는 큐레이션.",
    brandSlugs: [
      "matin-kim",
      "ader-error",
      "system",
      "recto",
      "d-antidote",
      "songzio",
    ],
  },
  {
    slug: "copenhagen",
    displayName: "Copenhagen",
    displayKo: "코펜하겐",
    country: "DK",
    coords: [12.5683, 55.6761],
    intro: "가니, 아크네. 북유럽의 절제와 컬러 감각이 모두 모이는 곳.",
    brandSlugs: ["ganni", "acne-studios"],
  },
];

const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));

export function getCityBySlug(slug: string): City | undefined {
  return CITY_BY_SLUG.get(slug);
}

/** 도시별 piece 수 — 실제 데이터 연결 전 placeholder.
 *  나중엔 brand → product 카운트로 계산하거나 큐레이션 메타에서 주입. */
export function getCityPieceCount(slug: string): number {
  const c = getCityBySlug(slug);
  if (!c) return 0;
  // 브랜드당 1-2 piece를 가정한 임시 계산식. 최소 3, 최대 14.
  return Math.max(3, Math.min(c.brandSlugs.length + 2, 14));
}
