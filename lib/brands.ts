/**
 * 홈 피드와 브랜드 디렉토리에서 사용할 공식 브랜드 리스트.
 *
 * 선정 기준:
 *  - Naver Shopping Open API (`/v1/search/shop.json`)에 쿼리했을 때
 *    최소 2개 이상의 몰이 잡히는 브랜드만 포함 (단일 몰 집계 = 대부분
 *    네이버 애그리게이터 풀이라 MT/저품질 섞임 위험이 크다).
 *  - 글로벌 브랜드 인지도가 있거나, 한국 컨템포러리 프리미엄.
 *
 * `query`는 실제 검증된 "best query" — 한국어 표기와 영문 표기 중
 *  몰 다양성이 더 높았던 쪽을 기본으로 쓴다 (scripts/probe-brands.mjs).
 *
 * `tier`:
 *  - "A" = 10+ malls 다양성, 공급 매우 안정
 *  - "B" = 5-9 malls, 건강한 공급
 *  - "C" = 2-4 malls, 얇지만 알려진 브랜드
 */

export type BrandCategory =
  | "luxury"
  | "contemporary"
  | "italian-heritage"
  | "japanese"
  | "american"
  | "denim"
  | "streetwear"
  | "sneaker"
  | "korean";

export type Brand = {
  slug: string;
  displayKo: string;
  displayEn: string;
  query: string;
  tier: "A" | "B" | "C";
  category: BrandCategory;
};

export const BRANDS: readonly Brand[] = [
  // === Luxury Maisons ===
  { slug: "hermes", displayKo: "에르메스", displayEn: "Hermès", query: "에르메스", tier: "A", category: "luxury" },
  { slug: "celine", displayKo: "셀린느", displayEn: "Celine", query: "셀린느", tier: "A", category: "luxury" },
  { slug: "louis-vuitton", displayKo: "루이비통", displayEn: "Louis Vuitton", query: "루이비통", tier: "A", category: "luxury" },
  { slug: "chanel", displayKo: "샤넬", displayEn: "Chanel", query: "샤넬", tier: "A", category: "luxury" },
  { slug: "dior", displayKo: "디올", displayEn: "Dior", query: "디올", tier: "A", category: "luxury" },
  { slug: "prada", displayKo: "프라다", displayEn: "Prada", query: "프라다", tier: "A", category: "luxury" },
  { slug: "gucci", displayKo: "구찌", displayEn: "Gucci", query: "구찌", tier: "A", category: "luxury" },
  { slug: "bottega-veneta", displayKo: "보테가 베네타", displayEn: "Bottega Veneta", query: "보테가베네타", tier: "A", category: "luxury" },
  { slug: "balenciaga", displayKo: "발렌시아가", displayEn: "Balenciaga", query: "발렌시아가", tier: "A", category: "luxury" },
  { slug: "saint-laurent", displayKo: "생로랑", displayEn: "Saint Laurent", query: "생로랑", tier: "A", category: "luxury" },
  { slug: "valentino", displayKo: "발렌티노", displayEn: "Valentino", query: "발렌티노", tier: "A", category: "luxury" },
  { slug: "ferragamo", displayKo: "페라가모", displayEn: "Ferragamo", query: "페라가모", tier: "A", category: "luxury" },
  { slug: "burberry", displayKo: "버버리", displayEn: "Burberry", query: "버버리", tier: "A", category: "luxury" },
  { slug: "moncler", displayKo: "몽클레어", displayEn: "Moncler", query: "몽클레어", tier: "A", category: "luxury" },
  { slug: "alexander-mcqueen", displayKo: "알렉산더 맥퀸", displayEn: "Alexander McQueen", query: "알렉산더 맥퀸", tier: "A", category: "luxury" },
  { slug: "tom-ford", displayKo: "톰 포드", displayEn: "Tom Ford", query: "톰포드", tier: "A", category: "luxury" },
  { slug: "miu-miu", displayKo: "미우미우", displayEn: "Miu Miu", query: "미우미우", tier: "A", category: "luxury" },
  { slug: "tods", displayKo: "토즈", displayEn: "TOD'S", query: "토즈", tier: "A", category: "luxury" },
  { slug: "dior-homme", displayKo: "디올 옴므", displayEn: "Dior Homme", query: "디올 옴므", tier: "B", category: "luxury" },
  { slug: "thom-browne", displayKo: "톰 브라운", displayEn: "Thom Browne", query: "톰브라운", tier: "B", category: "luxury" },

  // === Contemporary Designer / Editorial ===
  { slug: "lemaire", displayKo: "르메르", displayEn: "Lemaire", query: "르메르", tier: "A", category: "contemporary" },
  { slug: "the-row", displayKo: "더 로우", displayEn: "The Row", query: "더 로우", tier: "A", category: "contemporary" },
  { slug: "loewe", displayKo: "로에베", displayEn: "Loewe", query: "LOEWE", tier: "A", category: "contemporary" },
  { slug: "maison-margiela", displayKo: "메종 마르지엘라", displayEn: "Maison Margiela", query: "메종마르지엘라", tier: "A", category: "contemporary" },
  { slug: "chloe", displayKo: "클로에", displayEn: "Chloé", query: "클로에", tier: "A", category: "contemporary" },
  { slug: "etro", displayKo: "에트로", displayEn: "Etro", query: "에트로", tier: "A", category: "contemporary" },
  { slug: "armani", displayKo: "조르지오 아르마니", displayEn: "Giorgio Armani", query: "아르마니", tier: "A", category: "italian-heritage" },
  { slug: "acne-studios", displayKo: "아크네 스튜디오", displayEn: "Acne Studios", query: "아크네 스튜디오", tier: "B", category: "contemporary" },
  { slug: "ganni", displayKo: "가니", displayEn: "Ganni", query: "가니", tier: "B", category: "contemporary" },
  { slug: "jacquemus", displayKo: "자크뮈스", displayEn: "Jacquemus", query: "자크뮈스", tier: "C", category: "contemporary" },
  { slug: "ami-paris", displayKo: "아미 파리", displayEn: "AMI Paris", query: "아미 파리", tier: "C", category: "contemporary" },
  { slug: "marni", displayKo: "마르니", displayEn: "Marni", query: "마르니", tier: "C", category: "contemporary" },
  { slug: "theory", displayKo: "띠어리", displayEn: "Theory", query: "띠어리", tier: "C", category: "contemporary" },

  // === Japanese ===
  { slug: "comme-des-garcons", displayKo: "꼼데가르송", displayEn: "Comme des Garçons", query: "꼼데가르송", tier: "A", category: "japanese" },
  { slug: "issey-miyake", displayKo: "이세이 미야케", displayEn: "Issey Miyake", query: "이세이미야케", tier: "A", category: "japanese" },
  { slug: "kapital", displayKo: "카피탈", displayEn: "Kapital", query: "카피탈", tier: "A", category: "japanese" },
  { slug: "orslow", displayKo: "오어슬로우", displayEn: "orSlow", query: "오어슬로우", tier: "B", category: "japanese" },
  { slug: "yohji-yamamoto", displayKo: "요지 야마모토", displayEn: "Yohji Yamamoto", query: "요지 야마모토", tier: "C", category: "japanese" },
  { slug: "visvim", displayKo: "비즈빔", displayEn: "visvim", query: "visvim", tier: "C", category: "japanese" },

  // === American Heritage ===
  { slug: "polo-ralph-lauren", displayKo: "폴로 랄프로렌", displayEn: "Polo Ralph Lauren", query: "폴로 랄프로렌", tier: "A", category: "american" },
  { slug: "calvin-klein", displayKo: "캘빈클라인", displayEn: "Calvin Klein", query: "캘빈클라인", tier: "A", category: "american" },
  { slug: "coach", displayKo: "코치", displayEn: "Coach", query: "COACH", tier: "A", category: "american" },
  { slug: "tory-burch", displayKo: "토리버치", displayEn: "Tory Burch", query: "토리버치", tier: "A", category: "american" },
  { slug: "lacoste", displayKo: "라코스테", displayEn: "Lacoste", query: "라코스테", tier: "A", category: "american" },
  { slug: "marc-jacobs", displayKo: "마크 제이콥스", displayEn: "Marc Jacobs", query: "마크 제이콥스", tier: "A", category: "american" },
  { slug: "tommy-hilfiger", displayKo: "타미힐피거", displayEn: "Tommy Hilfiger", query: "타미힐피거", tier: "B", category: "american" },

  // === Denim / Casual ===
  { slug: "levis", displayKo: "리바이스", displayEn: "Levi's", query: "리바이스", tier: "A", category: "denim" },
  { slug: "apc", displayKo: "아페쎄", displayEn: "A.P.C.", query: "APC", tier: "C", category: "denim" },

  // === Streetwear ===
  { slug: "stussy", displayKo: "스투시", displayEn: "Stüssy", query: "Stussy", tier: "A", category: "streetwear" },
  { slug: "off-white", displayKo: "오프화이트", displayEn: "Off-White", query: "Off-White", tier: "B", category: "streetwear" },
  { slug: "supreme", displayKo: "슈프림", displayEn: "Supreme", query: "슈프림", tier: "B", category: "streetwear" },
  { slug: "palace", displayKo: "팔라스", displayEn: "Palace", query: "팔라스", tier: "C", category: "streetwear" },

  // === Sneakers ===
  { slug: "nike", displayKo: "나이키", displayEn: "Nike", query: "나이키", tier: "A", category: "sneaker" },
  { slug: "adidas", displayKo: "아디다스", displayEn: "Adidas", query: "아디다스", tier: "A", category: "sneaker" },
  { slug: "new-balance", displayKo: "뉴발란스", displayEn: "New Balance", query: "뉴발란스", tier: "A", category: "sneaker" },
  { slug: "converse", displayKo: "컨버스", displayEn: "Converse", query: "컨버스", tier: "A", category: "sneaker" },
  { slug: "vans", displayKo: "반스", displayEn: "Vans", query: "반스", tier: "A", category: "sneaker" },

  // === Korean Premium / Contemporary ===
  { slug: "matin-kim", displayKo: "마뗑킴", displayEn: "Matin Kim", query: "마뗑킴", tier: "A", category: "korean" },
  { slug: "wooyoungmi", displayKo: "우영미", displayEn: "Wooyoungmi", query: "우영미", tier: "B", category: "korean" },
  { slug: "ader-error", displayKo: "아더에러", displayEn: "ADER error", query: "아더에러", tier: "B", category: "korean" },
  { slug: "system", displayKo: "시스템", displayEn: "System", query: "시스템 브랜드", tier: "B", category: "korean" },
  { slug: "recto", displayKo: "렉토", displayEn: "Recto", query: "렉토 브랜드", tier: "B", category: "korean" },
  { slug: "d-antidote", displayKo: "디앤티도트", displayEn: "D-Antidote", query: "디앤티도트", tier: "B", category: "korean" },
  { slug: "juun-j", displayKo: "준지", displayEn: "Juun.J", query: "JUUN.J", tier: "C", category: "korean" },
  { slug: "songzio", displayKo: "송지오", displayEn: "Songzio", query: "송지오", tier: "C", category: "korean" },
];

/**
 * 홈 피드 진입 시 순차적으로 노출할 브랜드 순서.
 *
 * 규칙:
 *  - 처음 2~3개는 확실한 임팩트를 주기 위해 최상위 메종 중심 (에르메스·셀린느·루이비통).
 *  - 이후는 카테고리를 섞어 "럭셔리만 주르륵" 같은 단조로움을 피한다.
 *  - 아래로 갈수록 Tier B/C가 섞인다 (무한스크롤 끝까지 버틸 사람은 적으므로
 *    헤드에서 품질이 가장 보장되도록).
 *
 * 각 한 줄이 홈 피드의 한 섹션이 된다.
 */
export const HOME_BRAND_ORDER: readonly string[] = [
  // Heroes — 바로 인상 주는 최상위
  "hermes",
  "celine",
  "louis-vuitton",

  // 첫 스크롤 범위: 컨템포러리·일본·럭셔리·아메리칸 섞어서 다양성
  "lemaire",
  "prada",
  "the-row",
  "loewe",
  "polo-ralph-lauren",
  "moncler",
  "maison-margiela",
  "new-balance",
  "bottega-veneta",

  // 두번째 범위
  "miu-miu",
  "chloe",
  "comme-des-garcons",
  "chanel",
  "saint-laurent",
  "alexander-mcqueen",
  "coach",
  "burberry",
  "issey-miyake",
  "nike",

  // 세번째 범위 (korean / heritage 섞음)
  "matin-kim",
  "kapital",
  "valentino",
  "wooyoungmi",
  "tods",
  "acne-studios",
  "adidas",
  "gucci",
  "dior",
  "lacoste",

  // 네번째 범위
  "ader-error",
  "tory-burch",
  "armani",
  "calvin-klein",
  "ganni",
  "etro",
  "levis",
  "ferragamo",
  "converse",
  "system",

  // 다섯번째 범위 (Tier B/C 중심)
  "tom-ford",
  "off-white",
  "orslow",
  "marc-jacobs",
  "stussy",
  "thom-browne",
  "dior-homme",
  "recto",
  "supreme",
  "tommy-hilfiger",

  // 꼬리 (Tier C)
  "jacquemus",
  "ami-paris",
  "d-antidote",
  "miu-miu", // 중복 방지용이 아니라면 제거 — 검수
  "vans",
  "juun-j",
  "marni",
  "songzio",
  "yohji-yamamoto",
  "visvim",
  "theory",
  "apc",
  "palace",
].filter((slug, idx, arr) => arr.indexOf(slug) === idx); // 중복 제거 (수동 편집 안전망)

/** slug로 Brand를 빠르게 조회. */
const BRAND_BY_SLUG = new Map(BRANDS.map((b) => [b.slug, b]));

export function getBrandBySlug(slug: string): Brand | undefined {
  return BRAND_BY_SLUG.get(slug);
}

/** HOME_BRAND_ORDER를 Brand 객체 배열로 풀어낸다. 존재하지 않는 slug는 경고와 함께 무시. */
export function resolveHomeBrands(): Brand[] {
  const out: Brand[] = [];
  for (const slug of HOME_BRAND_ORDER) {
    const brand = BRAND_BY_SLUG.get(slug);
    if (!brand) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[brands] HOME_BRAND_ORDER references unknown slug: ${slug}`);
      }
      continue;
    }
    out.push(brand);
  }
  return out;
}
