/**
 * 링크프라이스(LinkPrice) 어필리에이트 딥링크 유틸.
 *
 * 동작:
 *  - 네이버 쇼핑 `mallName`이 지원 머천트일 경우 본인 ID·머천트 ID를 붙인
 *    `click.linkprice.com` 딥링크로 감싸고,
 *  - 지원 대상이 아니면 원본 URL을 그대로 반환한다 (외부 이동은 그대로 동작).
 *
 * 링크프라이스 딥링크 스펙:
 *   https://click.linkprice.com/click.php?m=<merchantId>&a=<affiliateId>&l=9999&url=<encoded>
 */

/** 본인(어필리에이트) ID. 링크프라이스 계정 고정값. */
export const AFFILIATE_ID = "A100704003";

/**
 * 링크프라이스 머천트 ID 상수.
 *
 * 실제 머천트 ID는 링크프라이스 대시보드에서 확정해야 한다.
 * 운영 ID가 정해지면 여기 문자열만 교체하면 되며, 매핑 테이블(`MERCHANT_MAP`)은
 * 자동으로 반영된다.
 */
export const MERCHANT_IDS = {
  farfetch: "farfetch",
  netaporter: "netaporter",
  wconcept: "wconcept",
  halfclub: "halfclub",
} as const;

export type MerchantKey = keyof typeof MERCHANT_IDS;

/**
 * 네이버 쇼핑 `mallName` → 링크프라이스 머천트 ID 매핑.
 *
 * 네이버는 mallName 표기를 일관되게 주지 않기 때문에(한국어/영문/대소문자 혼재)
 * 자주 등장하는 표기를 모두 나열한다. 대소문자 불일치를 허용하기 위해
 * `getAffiliateLink`에서 case-insensitive 매칭을 추가로 시도한다.
 */
export const MERCHANT_MAP: Record<string, string> = {
  // Farfetch (파페치)
  파페치: MERCHANT_IDS.farfetch,
  FARFETCH: MERCHANT_IDS.farfetch,
  Farfetch: MERCHANT_IDS.farfetch,
  farfetch: MERCHANT_IDS.farfetch,

  // Net-a-Porter (네타포르테)
  네타포르테: MERCHANT_IDS.netaporter,
  "NET-A-PORTER": MERCHANT_IDS.netaporter,
  "Net-a-Porter": MERCHANT_IDS.netaporter,
  NETAPORTER: MERCHANT_IDS.netaporter,
  "net-a-porter": MERCHANT_IDS.netaporter,
  netaporter: MERCHANT_IDS.netaporter,

  // 기타 기존 제휴
  W컨셉: MERCHANT_IDS.wconcept,
  하프클럽: MERCHANT_IDS.halfclub,
};

/**
 * 대소문자·공백 차이를 흡수해 매핑을 찾기 위한 사전 정규화 인덱스.
 * 키: `mallName.trim().toLowerCase()`.
 */
const MERCHANT_MAP_NORMALIZED: Record<string, string> = Object.entries(
  MERCHANT_MAP
).reduce<Record<string, string>>((acc, [rawKey, merchantId]) => {
  acc[rawKey.trim().toLowerCase()] = merchantId;
  return acc;
}, {});

/**
 * 주어진 상품의 (네이버) 원본 URL을 링크프라이스 딥링크로 변환한다.
 *
 * @param originalUrl 네이버 API가 반환하는 상품 상세 URL (`item.link`).
 * @param mallName    네이버 API의 `mallName` (예: "파페치", "NET-A-PORTER").
 * @returns 지원 머천트면 `click.linkprice.com/...` 딥링크, 아니면 `originalUrl` 그대로.
 */
export function getAffiliateLink(
  originalUrl: string,
  mallName: string
): string {
  const trimmed = mallName.trim();
  if (!trimmed || !originalUrl) {
    return originalUrl;
  }

  // 1차: 원본 표기 그대로 조회 (한글 키 "파페치"·"네타포르테" 빠른 경로).
  // 2차: 소문자·trim 정규화 후 재조회 ("Farfetch" / "FARFETCH" / "farfetch" 흡수).
  const merchantId =
    MERCHANT_MAP[trimmed] ?? MERCHANT_MAP_NORMALIZED[trimmed.toLowerCase()];

  if (!merchantId) {
    return originalUrl;
  }

  return (
    `https://click.linkprice.com/click.php` +
    `?m=${merchantId}` +
    `&a=${AFFILIATE_ID}` +
    `&l=9999` +
    `&url=${encodeURIComponent(originalUrl)}`
  );
}

/**
 * 해당 `mallName`이 링크프라이스 지원 대상인지 여부.
 * UI에서 "제휴 뱃지" 표시 등에 활용할 수 있다.
 */
export function isAffiliateSupported(mallName: string): boolean {
  const trimmed = mallName.trim();
  if (!trimmed) return false;
  return (
    Object.prototype.hasOwnProperty.call(MERCHANT_MAP, trimmed) ||
    Object.prototype.hasOwnProperty.call(
      MERCHANT_MAP_NORMALIZED,
      trimmed.toLowerCase()
    )
  );
}
