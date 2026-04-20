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
};

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

/** 네이버 쇼핑 API: display 최대 100, start 최대 1000 → 최대 10페이지 ≈ 1000건 */
const NAVER_SHOP_DISPLAY_MAX = 100;
const NAVER_SHOP_START_MAX = 1000;
const NAVER_SHOP_MAX_ITEMS = 1000;

async function fetchNaverShopPage(
  query: string,
  start: number,
  display: number,
  clientId: string,
  clientSecret: string
): Promise<NaverShoppingResponse> {
  const endpoint = new URL("https://openapi.naver.com/v1/search/shop.json");
  endpoint.searchParams.set("query", query);
  endpoint.searchParams.set("display", String(display));
  endpoint.searchParams.set("start", String(start));
  endpoint.searchParams.set("sort", "sim");

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

export async function fetchNaverProducts(query: string): Promise<Product[]> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("NAVER API credentials are missing.");
  }

  const collected: NaverShoppingItem[] = [];
  let start = 1;

  while (start <= NAVER_SHOP_START_MAX) {
    const page = await fetchNaverShopPage(
      query,
      start,
      NAVER_SHOP_DISPLAY_MAX,
      clientId,
      clientSecret
    );

    collected.push(...page.items);

    if (page.items.length < NAVER_SHOP_DISPLAY_MAX) {
      break;
    }
    if (collected.length >= NAVER_SHOP_MAX_ITEMS) {
      break;
    }
    if (
      page.total != null &&
      collected.length >= Math.min(page.total, NAVER_SHOP_MAX_ITEMS)
    ) {
      break;
    }

    const nextStart = start + NAVER_SHOP_DISPLAY_MAX;
    if (nextStart > NAVER_SHOP_START_MAX) {
      break;
    }
    start = nextStart;
  }

  const capped = collected.slice(0, NAVER_SHOP_MAX_ITEMS);
  return mapNaverItemsToProducts(capped, 0);
}

type SearchSource = {
  name: string;
  fetcher: (query: string) => Promise<Product[]>;
};

const searchSources: SearchSource[] = [
  {
    name: "naver",
    fetcher: fetchNaverProducts,
  },
];

export async function fetchUnifiedProducts(query: string): Promise<Product[]> {
  const settledResults = await Promise.all(
    searchSources.map(async (source) => {
      try {
        return await source.fetcher(query);
      } catch (error) {
        console.error(`[search:${source.name}]`, error);
        return [];
      }
    })
  );

  return settledResults
    .flat()
    .sort((left, right) => left.price - right.price);
}
