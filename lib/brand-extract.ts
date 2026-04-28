/**
 * 상품 타이틀에서 큐레이션된 브랜드명을 추출한다.
 *
 * 카드의 eyebrow를 "네이버" / 셀러 몰 이름이 아니라 브랜드명("PRADA", "HERMÈS")으로
 * 띄우기 위한 헬퍼. `lib/brands.ts`에 등록된 60여 개 브랜드만 대상으로 한다.
 *
 * 매칭 우선순위: BRANDS 배열 순서(럭셔리 → 컨템포러리 → 일본 → … → 한국 컨템포러리).
 * 첫 번째 hit에서 멈춘다. 한 타이틀에 두 브랜드가 동시에 등장하는 경우는 드물고,
 * 등장하면 보통 상위 메종이 진짜 주체이므로 큰 문제가 되지 않는다.
 *
 * 매칭 방식:
 *  - 한글 displayKo / query 변형 → 단순 substring (i 플래그)
 *    (한글 토큰은 단어 경계 개념이 약해 substring이 가장 잘 동작)
 *  - 영문 displayEn → \b…\b word-boundary (i 플래그)
 *    "프라다 PRADA" 모두 "PRADA"로 정규화한다.
 */

import { BRANDS, type Brand } from "@/lib/brands";

const escapeRegExp = (s: string): string =>
  s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

type Detector = {
  brand: Brand;
  patterns: RegExp[];
};

const DETECTORS: readonly Detector[] = BRANDS.map((brand) => {
  const patterns: RegExp[] = [];

  // 한글 표기 (substring)
  if (/[가-힣]/.test(brand.displayKo)) {
    patterns.push(new RegExp(escapeRegExp(brand.displayKo), "i"));
  }
  // 한글 query alias (예: "보테가 베네타" displayKo vs "보테가베네타" query)
  if (
    brand.query !== brand.displayKo &&
    /[가-힣]/.test(brand.query) &&
    !/\s+브랜드\s*$/i.test(brand.query) // "시스템 브랜드" 같은 helper 토큰은 제외
  ) {
    patterns.push(new RegExp(escapeRegExp(brand.query), "i"));
  }
  // 영문 표기 (word boundary)
  if (/[A-Za-zÀ-ÿ]/.test(brand.displayEn)) {
    patterns.push(new RegExp(`\\b${escapeRegExp(brand.displayEn)}\\b`, "i"));
  }
  return { brand, patterns };
});

/**
 * 정화된 상품 타이틀에서 큐레이션 브랜드를 찾는다.
 * 못 찾으면 undefined.
 *
 * 반환값은 `displayEn`을 대문자로 변환한 형태(예: "PRADA", "HERMÈS").
 * editorial 톤의 eyebrow에 그대로 붙이면 된다.
 */
export function extractBrand(productName: string): string | undefined {
  if (!productName) return undefined;
  for (const { brand, patterns } of DETECTORS) {
    for (const re of patterns) {
      if (re.test(productName)) {
        return brand.displayEn.toUpperCase();
      }
    }
  }
  return undefined;
}
