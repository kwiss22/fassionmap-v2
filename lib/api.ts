import { type Product } from "@/lib/product";
import { isBlockedMall, isBoostedMall } from "@/lib/mall-policy";
import { sanitizeTitle, titleFingerprint } from "@/lib/title-sanitize";
import { looksLikeRejectListing } from "@/lib/listing-guard";

type NaverShoppingItem = {
  productId: string;
  title: string;
  lprice: string;
  image: string;
  link: string;
  mallName?: string;
  category1: string;
  category2: string;
  category3: string;
};

type NaverShoppingResponse = {
  items: NaverShoppingItem[];
  /** 전체 검색 결과 수(응답에 없을 수 있음) */
  total?: number;
  start?: number;
  display?: number;
};

/**
 * 가격 sanity 범위. 패션 카테고리 기준으로 이 범위를 벗어나면
 * 거의 100% 도매 실수/광고용 가격/키워드 낚시다.
 */
const MIN_PRICE_KRW = 1_000;
const MAX_PRICE_KRW = 20_000_000;

/** sanitize 후 타이틀이 이보다 짧으면 의미 정보가 남지 않은 것으로 보고 drop. */
const MIN_TITLE_LENGTH = 3;

/** 네이버 쇼핑 API 제약: display 최대 100, start 최대 1000 */
export const NAVER_SHOP_DISPLAY_MAX = 100;
export const NAVER_SHOP_START_MAX = 1000;

/** 정렬 기준 — 네이버 쇼핑 API `sort` 값과 1:1로 매핑됨 */
export type SortKey = "sim" | "date" | "asc" | "dsc";

export const SORT_KEYS: SortKey[] = ["sim", "date", "asc", "dsc"];

export function parseSortKey(value: string | null | undefined): SortKey {
  if (value && (SORT_KEYS as string[]).includes(value)) {
    return value as SortKey;
  }
  return "sim";
}

export type SearchOptions = {
  /** 1-based 시작 인덱스 (기본 1) */
  start?: number;
  /** 한 페이지 결과 수 (1~100, 기본 40) */
  display?: number;
  /** 정렬 (기본 sim) */
  sort?: SortKey;
};

export type SearchPage = {
  items: Product[];
  total: number;
  start: number;
  display: number;
  /** 다음 페이지 요청 가능 여부 */
  hasMore: boolean;
  /** 다음 페이지의 start 인덱스 (hasMore일 때만 유효) */
  nextStart: number;
};

async function fetchNaverShopPage(
  query: string,
  start: number,
  display: number,
  sort: SortKey,
  clientId: string,
  clientSecret: string
): Promise<NaverShoppingResponse> {
  const endpoint = new URL("https://openapi.naver.com/v1/search/shop.json");
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("display", String(display));
  endpoint.searchParams.set("start", String(start));
  endpoint.searchParams.set("sort", sort);

  const response = await fetch(endpoint.toString(), {
    method: "GET",
    headers: {
      "X-Naver-Client-Id": clientId,
      "X-Naver-Client-Secret": clientSecret,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Naver products: ${response.status}`);
  }

  return (await response.json()) as NaverShoppingResponse;
}

/** 내부 사용: 정책 적용 중 boost 여부를 잠깐 들고 다니기 위한 확장 타입. */
type ScoredProduct = Product & { _boosted: boolean };

function mapNaverItemsToProducts(
  items: NaverShoppingItem[],
  startOffset: number
): ScoredProduct[] {
  return items.map((item, index) => {
    const name = sanitizeTitle(item.title);
    return {
      id: `${item.productId || "naver"}-${startOffset + index}`,
      name,
      mall: "네이버",
      mallName: item.mallName || "",
      price: Number(item.lprice) || 0,
      imageUrl: item.image,
      link: item.link,
      category2: item.category2 || "",
      _boosted: isBoostedMall(item.mallName),
    };
  });
}

/**
 * 정책 필터 + 중복 제거 + 부스트 몰 reordering.
 *
 * - 블록 몰 / 비정상 가격 / sanitize 후 너무 짧은 타이틀을 제거.
 * - titleFingerprint 기준 중복 제거: 같은 물리 상품이 여러 몰에서 올라온 경우 첫 등장만 남긴다.
 *   (이미 부스트 몰이 앞쪽에 있지 않으므로, 일단 원래 순서로 dedup 한 뒤 stable-sort로 부스트를 올린다.
 *    그렇지 않으면 부스트 몰이 뒤쪽에 있다가 앞쪽 일반 몰에 의해 잡아먹힌다.)
 * - 마지막으로 부스트 몰을 앞으로 stable sort.
 *
 * hasMore 판정은 호출자(`fetchNaverProductsPage`)가 Naver 원본 응답 count 기준으로 하므로,
 * 여기서 몇 개가 잘려나가도 다음 페이지 요청 여부에는 영향이 없다.
 */
function applyListingPolicy(candidates: ScoredProduct[]): Product[] {
  // 1-pass: 부스트 먼저 훑어 fingerprint를 선점시킨다.
  //         → 동일 상품이 일반 몰 + 부스트 몰에서 같이 떴을 때 부스트 몰이 남는다.
  const boostedFirst = [
    ...candidates.filter((p) => p._boosted),
    ...candidates.filter((p) => !p._boosted),
  ];

  const seenFingerprints = new Set<string>();
  const kept: ScoredProduct[] = [];

  for (const product of boostedFirst) {
    if (!product.name || product.name.length < MIN_TITLE_LENGTH) continue;
    if (isBlockedMall(product.mallName)) continue;
    if (product.price < MIN_PRICE_KRW || product.price > MAX_PRICE_KRW) {
      continue;
    }

    // 타이틀 기반 REJECT: 중국 드랍쉬핑 직역·명품 호환 대체품 등을 걸러낸다.
    // BOOST 몰은 번역 톤이 독특할 수 있으므로 면제한다.
    if (!product._boosted && looksLikeRejectListing(product.name)) {
      continue;
    }

    const fp = titleFingerprint(product.name);
    if (fp && seenFingerprints.has(fp)) continue;
    if (fp) seenFingerprints.add(fp);

    kept.push(product);
  }

  // boostedFirst 단계에서 이미 부스트가 앞에 있지만, 가독성을 위해 한 번 더 stable sort.
  kept.sort((a, b) => Number(b._boosted) - Number(a._boosted));

  return kept.map(({ _boosted: _b, ...rest }) => rest);
}

function clampDisplay(display: number | undefined): number {
  if (!display || display < 1) return 40;
  return Math.min(display, NAVER_SHOP_DISPLAY_MAX);
}

function clampStart(start: number | undefined): number {
  if (!start || start < 1) return 1;
  return Math.min(start, NAVER_SHOP_START_MAX);
}

export async function fetchNaverProductsPage(
  query: string,
  options: SearchOptions = {}
): Promise<SearchPage> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("NAVER API credentials are missing.");
  }

  const start = clampStart(options.start);
  const display = clampDisplay(options.display);
  const sort = options.sort ?? "sim";

  const page = await fetchNaverShopPage(
    query,
    start,
    display,
    sort,
    clientId,
    clientSecret
  );

  const mapped = mapNaverItemsToProducts(page.items, start - 1);
  const items = applyListingPolicy(mapped);
  const total = page.total ?? page.items.length;
  const nextStart = start + display;

  // hasMore는 Naver가 돌려준 raw 응답 기준으로 판단한다.
  // 정책 필터로 items.length가 줄어들어도 "Naver 쪽에 다음 페이지가 있느냐"와는 무관하기 때문.
  const hasMore =
    page.items.length >= display &&
    nextStart <= NAVER_SHOP_START_MAX &&
    nextStart <= total;

  return {
    items,
    total,
    start,
    display,
    hasMore,
    nextStart,
  };
}
