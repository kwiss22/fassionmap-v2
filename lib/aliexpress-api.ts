import type { SortKey } from "@/lib/api";
import { signTopMd5, topApiTimestamp } from "@/lib/aliexpress/sign";
import { APP_MARKET } from "@/lib/market";
import type { Product } from "@/lib/product";

/** AliExpress Affiliate 앱은 Taobao eco 게이트웨이가 아닌 SG sync 엔드포인트를 씁니다. */
const DEFAULT_GATEWAY = "https://api-sg.aliexpress.com/sync";
const METHOD = "aliexpress.affiliate.product.query";
const PAGE_SIZE_MAX = 50;

type AliexpressSearchOptions = {
  pageNo?: number;
  pageSize?: number;
  sort?: SortKey;
  minPrice?: number;
  maxPrice?: number;
};

export type AliexpressSearchPage = {
  items: Product[];
  total: number;
  pageNo: number;
  pageSize: number;
  hasMore: boolean;
  nextPageNo: number;
};

type AliRawProduct = {
  product_id?: string | number;
  product_title?: string;
  product_main_image_url?: string;
  promotion_link?: string;
  product_detail_url?: string;
  target_sale_price?: string;
  sale_price?: string;
  shop_name?: string;
  first_level_category_name?: string;
};

function mapAliSort(sort: SortKey): string {
  switch (sort) {
    case "asc":
      return "SALE_PRICE_ASC";
    case "dsc":
      return "SALE_PRICE_DESC";
    case "date":
      return "LAST_VOLUME_DESC";
    case "sim":
    default:
      return "LAST_VOLUME_DESC";
  }
}

function parsePrice(raw: AliRawProduct): number {
  const target = Number(raw.target_sale_price);
  if (Number.isFinite(target) && target > 0) {
    return Math.round(target * 100) / 100;
  }
  const sale = Number(raw.sale_price);
  if (Number.isFinite(sale) && sale > 0) {
    return Math.round(sale * 100) / 100;
  }
  return 0;
}

function mapAliProduct(raw: AliRawProduct, index: number): Product | null {
  const id = String(raw.product_id ?? "").trim();
  const name = (raw.product_title ?? "").trim();
  const imageUrl = (raw.product_main_image_url ?? "").trim();
  const link = (raw.promotion_link ?? raw.product_detail_url ?? "").trim();
  const price = parsePrice(raw);

  if (!id || !name || !imageUrl || !link || price <= 0) return null;

  return {
    id: `ali-${id}-${index}`,
    name,
    mall: "AliExpress",
    mallName: raw.shop_name?.trim() || "AliExpress",
    price,
    imageUrl,
    link,
    category2: raw.first_level_category_name?.trim(),
    source: "aliexpress",
  };
}

function normalizeProductList(raw: unknown): AliRawProduct[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as AliRawProduct[];
  if (typeof raw !== "object") return [];

  const container = raw as { product?: AliRawProduct | AliRawProduct[] };
  const product = container.product;
  if (Array.isArray(product)) return product;
  if (product && typeof product === "object") return [product];
  return [];
}

function getCredentials() {
  const appKey = process.env.ALIEXPRESS_APP_KEY?.trim();
  const appSecret = process.env.ALIEXPRESS_APP_SECRET?.trim();
  if (!appKey || !appSecret) {
    throw new Error(
      "ALIEXPRESS_APP_KEY / ALIEXPRESS_APP_SECRET are missing in environment."
    );
  }
  return {
    appKey,
    appSecret,
    trackingId: process.env.ALIEXPRESS_TRACKING_ID?.trim() ?? "",
    gateway: process.env.ALIEXPRESS_API_GATEWAY?.trim() || DEFAULT_GATEWAY,
  };
}

export async function fetchAliexpressProductsPage(
  query: string,
  options: AliexpressSearchOptions = {}
): Promise<AliexpressSearchPage> {
  const keywords = query.trim();
  if (!keywords) {
    return {
      items: [],
      total: 0,
      pageNo: 1,
      pageSize: 0,
      hasMore: false,
      nextPageNo: 1,
    };
  }

  const { appKey, appSecret, trackingId, gateway } = getCredentials();
  const pageNo = Math.max(1, options.pageNo ?? 1);
  const pageSize = Math.min(
    PAGE_SIZE_MAX,
    Math.max(1, options.pageSize ?? 40)
  );

  const business: Record<string, string> = {
    keywords,
    page_no: String(pageNo),
    page_size: String(pageSize),
    sort: mapAliSort(options.sort ?? "sim"),
    target_currency: APP_MARKET.aliexpress.targetCurrency,
    target_language: APP_MARKET.aliexpress.targetLanguage,
    ship_to_country: APP_MARKET.aliexpress.shipToCountry,
    fields:
      "product_id,product_title,product_main_image_url,promotion_link,product_detail_url,target_sale_price,sale_price,shop_name,first_level_category_name",
  };

  if (trackingId) {
    business.tracking_id = trackingId;
  }
  if (options.minPrice && options.minPrice > 0) {
    business.min_sale_price = String(options.minPrice);
  }
  if (options.maxPrice && options.maxPrice > 0) {
    business.max_sale_price = String(options.maxPrice);
  }

  const params: Record<string, string> = {
    method: METHOD,
    app_key: appKey,
    sign_method: "md5",
    timestamp: topApiTimestamp(),
    format: "json",
    v: "2.0",
    simplify: "true",
    ...business,
  };

  params.sign = signTopMd5(params, appSecret);

  const body = new URLSearchParams(params);
  const response = await fetch(gateway, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
    },
    body: body.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`AliExpress API HTTP ${response.status}`);
  }

  const json = (await response.json()) as Record<string, unknown>;

  const errorResponse = json.error_response as Record<string, unknown> | undefined;
  if (errorResponse) {
    const msg = String(errorResponse.msg ?? errorResponse.sub_msg ?? "AliExpress error");
    const code = String(errorResponse.code ?? errorResponse.sub_code ?? "");
    throw new Error(`AliExpress API: ${msg}${code ? ` (${code})` : ""}`);
  }

  const root =
    (json.aliexpress_affiliate_product_query_response as Record<string, unknown>) ??
    json;

  const respResult = root.resp_result as Record<string, unknown> | undefined;
  const respCode = Number(respResult?.resp_code ?? root.resp_code);
  if (respCode && respCode !== 200) {
    const msg = String(respResult?.resp_msg ?? root.resp_msg ?? "AliExpress error");
    throw new Error(`AliExpress API: ${msg} (${respCode})`);
  }

  const result = (respResult?.result ?? root.result) as
    | Record<string, unknown>
    | undefined;
  if (!result) {
    return {
      items: [],
      total: 0,
      pageNo,
      pageSize,
      hasMore: false,
      nextPageNo: pageNo,
    };
  }

  const rawProducts = normalizeProductList(result.products);
  const items = rawProducts
    .map((raw, index) => mapAliProduct(raw, index))
    .filter((p): p is Product => p !== null);

  const total = Number(result.total_record_count ?? items.length);
  const totalPages = Number(result.total_page_no ?? pageNo);
  const hasMore = pageNo < totalPages;

  return {
    items,
    total: Number.isFinite(total) ? total : items.length,
    pageNo,
    pageSize,
    hasMore,
    nextPageNo: hasMore ? pageNo + 1 : pageNo,
  };
}
