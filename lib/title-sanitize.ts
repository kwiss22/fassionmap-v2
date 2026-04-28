/**
 * 네이버 쇼핑 title을 에디토리얼 톤으로 정화한다.
 *
 * 네이버가 주는 원본 타이틀은 판매자가 검색 노출을 위해 구겨 넣은 프로모션·스팸 토큰이 섞여 있다.
 *   예: "<b>[무료배송]</b>★정품보장★ [S/S NEW] 캐시미어 100% 니트 베이지 M L XL 남녀공용"
 *
 * 제거하는 것:
 *  - HTML 태그 (<b> 등 네이버 하이라이트)
 *  - 괄호로 감싼 프로모션 토큰: [무료배송], (당일출고), 【SALE】 등
 *  - 문장 중간의 스팸 단어: 정품보장, 무료배송, 당일출발, 최저가 …
 *  - 장식 기호(★ ♡ ◆ …)와 이모지
 *  - 사이즈 나열: S/M/L, 85 90 95, (XS,S,M,L)
 *
 * 유지하는 것: 브랜드, 상품명, 색상, 재질, 시즌 토큰 같은 의미 정보.
 * 토큰 재배열은 하지 않는다 — 제거만 한다.
 */

const HTML_TAG = /<[^>]*>/g;

// [ ], ( ), 【 】, （ ） 안에 프로모션 키워드가 들어간 블록 전체를 제거.
// 키워드 양쪽으로 임의 문자가 붙어 있어도 (예: "[무료배송/당일]") 함께 날린다.
const PROMO_BRACKETS =
  /[[(【（][^)\]】）]{0,24}(?:무료\s*배송|당일\s*(?:출고|출발|발송|배송)|오늘\s*출발|빠른\s*(?:출고|배송)|특가|할인|세일|sale|new|best|hot|event|이벤트|정품|기획|한정|행사|쿠폰|적립|리퍼|신상|리뉴얼|신제품|주말\s*특가|s\s*\/?\s*s|f\s*\/?\s*w)[^)\]】）]{0,24}[)\]】）]/gi;

// 괄호 없이 문장에 박혀 있는 스팸/프로모션 토큰.
//
// NOTE: JS `\b`는 ASCII word-character 경계라 순수 한글 토큰에는 동작하지 않는다.
// 한글-only 패턴에는 의도적으로 `\b`를 붙이지 않았다. 영문이 섞인 토큰만 `\b` 사용.
const SPAM_TOKENS: readonly RegExp[] = [
  /정품\s*보장/g,
  /100\s*%?\s*정품/g,
  /\bAS\s*가능/gi,
  /국내\s*배송/g,
  /무료\s*배송/g,
  /당일\s*(?:출고|출발|발송|배송)/g,
  /빠른\s*(?:출고|배송)/g,
  /오늘\s*출발/g,
  /최저가/g,
  /초\s*특가/g,
  /품절\s*임박/g,
  /한정\s*수량/g,
  /재입고/g,
  /사은품/g,
  /남녀\s*공용/g,
];

// 장식 기호
const DECORATIONS = /[★☆♥♡◆◇▶◀▲▼※♠♣❤️✨🔥💥]+/g;

// Unicode 이모지 전반
const EMOJI =
  /[\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F0FF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu;

// S/M/L, XS-XL, FREE 같은 옷 사이즈 나열(2개 이상 연결된 경우만).
// 구분자는 / , · 또는 공백 모두 허용 — "M L XL"처럼 공백으로 늘어놓는 패턴이 흔함.
const ALPHA_SIZE_RUN =
  /\b(?:XXS|XS|S|M|L|XL|XXL|XXXL|FREE)(?:\s*[\/,·]?\s+(?:XXS|XS|S|M|L|XL|XXL|XXXL|FREE)){1,}\b/gi;

// 80 85 90 95 100 같은 신발·의류 치수 나열(2개 이상 연결된 경우만).
// 구분자에 공백 포함.
const NUMERIC_SIZE_RUN = /\b\d{2,3}(?:\s*[\/,·]?\s+\d{2,3}){1,}\b/g;

// SKU/모델코드 — 4자 이상이면서 영문 + 숫자가 섞인 토큰 + 이어지는 2-3자 대문자 잔재.
//   예: "1BH089", "CL40194U", "1BA204 ZLP", "PRL2024 SS"
// 패션 상품명에서 4자 이상 알파+숫자 혼합 토큰은 사실상 100% SKU이고,
// SKU 뒤에 따라오는 2-3자 ALL-CAPS은 색상 코드/시즌 약어 잔재인 경우가 압도적이라
// 한 매치로 묶어 떼낸다 (색상 단어 BLACK/WHITE 등 4자+ 단어는 보존).
const SKU_CODE =
  /\b(?=[A-Z0-9]*[A-Z])(?=[A-Z0-9]*\d)[A-Z0-9]{4,}(?:\s+[A-Z]{2,3}\b)*/g;

// 순수 숫자 SKU — 6자리 이상의 숫자 단독 토큰.
//   예: "80911431" (버버리 SKU), "1234567"
// 가격이나 사이즈는 sanitize 단계에서 별도로 다루기 때문에 6자리 이상은 SKU로 본다.
const NUMERIC_SKU = /\b\d{6,}\b/g;

// 꼬리에 남은 짧은 코드 잔재. SKU를 떼고 나면 "ZMY", "01A 52" 같은 2-3자 단편이 남는다.
//   - 각 토큰이 1-3자, 숫자가 적어도 하나 포함 (색상 "BLACK" 보존)
//   - 또는 순수 대문자 2-3자 잔재 ("ZMY", "ZLP")
//   - 문장 맨 끝에 붙어 있을 때만 제거
const TRAILING_SHORT_CODES =
  /(?:\s+(?:(?=[A-Z0-9]{1,3}\b)(?=[A-Z0-9]*\d)[A-Z0-9]{1,3}|[A-Z]{2,3})\b){1,4}\s*$/;

// 연도/시즌 코드 — "24FW", "25SS", "S/S 2024", "F/W 24"
const SEASON_CODE =
  /\b(?:\d{2}\s*(?:S\s*\/?\s*S|F\s*\/?\s*W|SS|FW)|(?:S\s*\/?\s*S|F\s*\/?\s*W)\s*\d{2,4})\b/gi;

// 추가 스팸/마케팅 토큰. 한글 토큰엔 `\b` 사용 안 함.
const EXTRA_SPAM: readonly RegExp[] = [
  /공식\s*(?:수입|정품|스토어|판매처|입점|판매)/g,
  /백화점\s*(?:정품|입점|상품)/g,
  /면세점\s*(?:상품|정품)/g,
  /새\s*상품/g,
  /미\s*개봉/g,
  /택\s*포함/g,
  /선물\s*포장/g,
  /신상품/g,
  /신상(?!품)/g, // "25SS 신상" 같은 marketing 토큰. 신상품은 위에서 이미 처리.
];

export function sanitizeTitle(raw: string): string {
  if (!raw) return "";

  let text = raw
    .replace(HTML_TAG, " ")
    .replace(PROMO_BRACKETS, " ")
    .replace(DECORATIONS, " ")
    .replace(EMOJI, " ");

  for (const pattern of SPAM_TOKENS) {
    text = text.replace(pattern, " ");
  }
  for (const pattern of EXTRA_SPAM) {
    text = text.replace(pattern, " ");
  }

  text = text
    .replace(SEASON_CODE, " ")
    .replace(SKU_CODE, " ")
    .replace(NUMERIC_SKU, " ")
    .replace(ALPHA_SIZE_RUN, " ")
    .replace(NUMERIC_SIZE_RUN, " ")
    // 남은 빈 괄호쌍 정리
    .replace(/[[(【（]\s*[)\]】）]/g, " ")
    // 연속 구두점 정리
    .replace(/\s*,\s*,+/g, ", ")
    // 공백 정리
    .replace(/\s+/g, " ")
    .trim();

  // SKU를 떼고 나면 끝에 "01A 52" 같은 단편이 남는데, 이건 trim 후에 잡아야 한다.
  text = text.replace(TRAILING_SHORT_CODES, "").trim();

  return text;
}

/**
 * 같은 물리적 상품이 복수 몰에서 조금 다른 타이틀로 올라와도 같은 키를 만들도록 설계한 지문.
 *
 * - sanitize 이후 소문자화
 * - 공백/구두점/괄호류 제거
 * - 앞에서 40자만 사용 → 사이즈/색상 variant suffix는 무시
 *
 * 짧은 타이틀(브랜드+모델명만)이면 거의 그대로 키가 된다.
 */
export function titleFingerprint(sanitized: string): string {
  if (!sanitized) return "";
  return sanitized
    .toLowerCase()
    .replace(/[\s.,·\-/()[\]{}!?"'“”‘’]+/g, "")
    .slice(0, 40);
}
