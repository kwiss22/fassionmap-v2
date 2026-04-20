import { type Product } from "@/lib/product";

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

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

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

function mapNaverItemsToProducts(
  items: NaverShoppingItem[],
  startOffset: number
): Product[] {
  return items.map((item, index) => ({
    id: `${item.productId || "naver"}-${startOffset + index}`,
    name: stripHtmlTags(item.title),
    mall: "네이버",
    mallName: item.mallName || "",
    price: Number(item.lprice) || 0,
    imageUrl: item.image,
    link: item.link,
    category2: item.category2 || "",
  }));
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

  const items = mapNaverItemsToProducts(page.items, start - 1);
  const total = page.total ?? items.length;
  const nextStart = start + display;

  // 다음 페이지 존재 조건: 이번 페이지가 꽉 찼고 & start 상한을 아직 안 넘었고 & total 기준으로도 더 있음
  const hasMore =
    items.length >= display &&
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
