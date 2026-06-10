import type { SortKey } from "@/lib/api";

/** Primary launch market — English UI, US shipping, USD for Global source. */
export const APP_MARKET = {
  id: "en-US",
  locale: "en-US" as const,
  defaultShopSource: "ali" as const,
  shopSources: [
    {
      key: "ali" as const,
      label: "Global",
      description:
        "Worldwide marketplace listings. Prices in USD with US shipping estimates.",
    },
    {
      key: "naver" as const,
      label: "K-Fashion",
      description:
        "Trend-led picks from Korea and Asia. Product titles may appear in Korean; prices in KRW.",
    },
  ],
  defaultBrowseQuery: {
    ali: "women fashion",
    naver: "korean women fashion",
  },
  categories: [
    { key: "all", label: "All", querySuffix: "" },
    { key: "apparel", label: "Apparel", querySuffix: "apparel" },
    { key: "outerwear", label: "Outerwear", querySuffix: "outerwear" },
    { key: "bags", label: "Bags", querySuffix: "bag" },
    { key: "shoes", label: "Shoes", querySuffix: "shoes" },
    { key: "accessories", label: "Accessories", querySuffix: "accessories" },
    { key: "jewelry", label: "Jewelry", querySuffix: "jewelry" },
    { key: "sunglasses", label: "Sunglasses", querySuffix: "sunglasses" },
    { key: "fragrance", label: "Fragrance", querySuffix: "perfume" },
  ],
  sortOptions: [
    { key: "sim" as SortKey, label: "Relevance" },
    { key: "date" as SortKey, label: "Newest" },
    { key: "asc" as SortKey, label: "Price ↑" },
    { key: "dsc" as SortKey, label: "Price ↓" },
  ],
  aliexpress: {
    targetCurrency: "USD",
    targetLanguage: "EN",
    shipToCountry: "US",
  },
} as const;

export type MarketCategoryKey = (typeof APP_MARKET.categories)[number]["key"];
export type MarketShopSourceKey = (typeof APP_MARKET.shopSources)[number]["key"];

export function parseMarketCategory(value: string | null): MarketCategoryKey {
  const found = APP_MARKET.categories.find((c) => c.key === value);
  return found?.key ?? "all";
}

export function parseMarketShopSource(value: string | null): MarketShopSourceKey {
  if (value === "naver") return "naver";
  return APP_MARKET.defaultShopSource;
}

export function buildShopQuery(
  keyword: string,
  categoryKey: MarketCategoryKey,
  source: MarketShopSourceKey
): string {
  const t = keyword.trim();
  const category = APP_MARKET.categories.find((c) => c.key === categoryKey);
  const suffix = category?.querySuffix ?? "";

  if (!t) {
    if (categoryKey !== "all") return "";
    return APP_MARKET.defaultBrowseQuery[source];
  }

  if (categoryKey === "all") return t;
  return suffix ? `${t} ${suffix}` : t;
}
