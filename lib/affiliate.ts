/**
 * 링크프라이스 어필리에이트 ID
 */
export const AFFILIATE_ID = "A100704003";

/**
 * 네이버 쇼핑 API `mallName` → 링크프라이스 머천트 ID
 * (제휴·머천트 코드는 링크프라이스 대시보드 기준으로 맞춰 확장하면 됩니다.)
 */
export const MERCHANT_MAP: Record<string, string> = {
  파페치: "farfetch",
  FARFETCH: "farfetch",
  Farfetch: "farfetch",
  farfetch: "farfetch",
  "W컨셉": "wconcept",
  하프클럽: "halfclub",
};

export function getAffiliateLink(originalUrl: string, mallName: string): string {
  const key = mallName.trim();
  if (!key) {
    return originalUrl;
  }

  const merchantId = MERCHANT_MAP[key];
  if (!merchantId) {
    return originalUrl;
  }

  return `https://click.linkprice.com/click.php?m=${merchantId}&a=${AFFILIATE_ID}&l=9999&url=${encodeURIComponent(originalUrl)}`;
}
