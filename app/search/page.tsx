"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { TopBar } from "@/components/layout/TopBar";
import { StyleLabScreen } from "@/components/style-lab/StyleLabScreen";
import { productDedupeKey, type Product } from "@/lib/product";
import {
  NAVER_SHOP_DISPLAY_MAX,
  NAVER_SHOP_START_MAX,
  parseSortKey,
  type SortKey,
} from "@/lib/api";
import {
  APP_MARKET,
  buildShopQuery,
  parseMarketCategory,
  parseMarketShopSource,
  type MarketCategoryKey,
  type MarketShopSourceKey,
} from "@/lib/market";
import { cn } from "@/lib/utils";

type SearchMode = "shop" | "ai";
type ShopSource = MarketShopSourceKey;

const PAGE_SIZE = 40;
const REACHABLE_CEILING =
  NAVER_SHOP_START_MAX - 1 + Math.min(PAGE_SIZE, NAVER_SHOP_DISPLAY_MAX);

type NaverSearchResponse = {
  items?: Product[];
  total?: number;
  hasMore?: boolean;
  nextStart?: number;
  error?: string;
};

type AliSearchResponse = {
  items?: Product[];
  total?: number;
  hasMore?: boolean;
  nextPageNo?: number;
  error?: string;
};

function parseMode(value: string | null): SearchMode {
  return value === "ai" ? "ai" : "shop";
}

function SearchModeTabs({
  mode,
  onChange,
}: {
  mode: SearchMode;
  onChange: (mode: SearchMode) => void;
}) {
  return (
    <div
      className="flex gap-1 rounded-sm border border-outline-variant p-1"
      role="tablist"
      aria-label="Search mode"
    >
      {(
        [
          { key: "shop" as const, label: "Shop" },
          { key: "ai" as const, label: "AI Curation" },
        ] as const
      ).map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={mode === tab.key}
          data-active={mode === tab.key}
          className={cn(
            "flex-1 rounded-sm px-3 py-2 text-[11px] tracking-[0.16em] transition-colors",
            mode === tab.key
              ? "bg-on-surface text-surface"
              : "text-on-surface-variant hover:text-on-surface"
          )}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function ShopSearchPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [shopSource, setShopSource] = useState<ShopSource>(() =>
    parseMarketShopSource(searchParams.get("src"))
  );
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<MarketCategoryKey>(
    parseMarketCategory(searchParams.get("c"))
  );
  const [sort, setSort] = useState<SortKey>(
    parseSortKey(searchParams.get("sort"))
  );

  const [items, setItems] = useState<Product[]>([]);
  const [nextStart, setNextStart] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  const isBrowseFeed = !keyword.trim() && category === "all";
  const isAli = shopSource === "ali";
  const sourceMeta = APP_MARKET.shopSources.find((s) => s.key === shopSource);

  const query = useMemo(
    () => buildShopQuery(keyword, category, shopSource),
    [keyword, category, shopSource]
  );

  useEffect(() => {
    setShopSource(parseMarketShopSource(searchParams.get("src")));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("mode", "shop");
    if (shopSource === "naver") params.set("src", "naver");
    if (keyword.trim()) params.set("q", keyword.trim());
    if (category !== "all") params.set("c", category);
    if (sort !== "sim") params.set("sort", sort);
    const qs = params.toString();
    if (qs === searchParams.toString()) return;

    const timer = setTimeout(() => {
      router.replace(`/search?${qs}`, { scroll: false });
    }, keyword.trim() ? 300 : 0);

    return () => clearTimeout(timer);
  }, [keyword, category, sort, shopSource, router, searchParams]);

  const load = useCallback(
    async (reset = false) => {
      if (!query) {
        setItems([]);
        setTotal(0);
        setHasMore(false);
        return;
      }
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      if (reset) {
        seenRef.current = new Set();
        setItems([]);
        setNextStart(1);
        setLoadError(null);
      }

      try {
        if (isAli) {
          const pageNo = reset ? 1 : nextStart;
          const url = `/api/aliexpress-products?query=${encodeURIComponent(query)}&page_no=${pageNo}&page_size=${PAGE_SIZE}&sort=${sort}`;
          const res = await fetch(url, { signal: controller.signal });
          const json = (await res.json()) as AliSearchResponse;
          if (controller.signal.aborted) return;
          if (!res.ok || json.error) {
            setLoadError(
              json.error ??
                `Global shopping API error (${res.status}). Check ALIEXPRESS_APP_KEY/SECRET in .env.local.`
            );
            if (reset) {
              setItems([]);
              setTotal(0);
              setHasMore(false);
            }
            return;
          }
          setLoadError(null);
          const fresh: Product[] = [];
          for (const item of json.items ?? []) {
            const k = productDedupeKey(item);
            if (seenRef.current.has(k)) continue;
            seenRef.current.add(k);
            fresh.push(item);
          }
          setItems((prev) => (reset ? fresh : [...prev, ...fresh]));
          setTotal(json.total ?? 0);
          setHasMore(!!json.hasMore);
          setNextStart(json.nextPageNo ?? pageNo);
        } else {
          const start = reset ? 1 : nextStart;
          const display = Math.min(PAGE_SIZE, NAVER_SHOP_DISPLAY_MAX);
          const url = `/api/naver-products?query=${encodeURIComponent(query)}&start=${start}&display=${display}&sort=${sort}`;
          const res = await fetch(url, { signal: controller.signal });
          const json = (await res.json()) as NaverSearchResponse;
          if (controller.signal.aborted) return;
          if (!res.ok || json.error) {
            setLoadError(
              json.error ??
                `K-Fashion API error (${res.status}). Check NAVER_CLIENT_ID/SECRET in .env.local.`
            );
            if (reset) {
              setItems([]);
              setTotal(0);
              setHasMore(false);
            }
            return;
          }
          setLoadError(null);
          const fresh: Product[] = [];
          for (const item of json.items ?? []) {
            const k = productDedupeKey(item);
            if (seenRef.current.has(k)) continue;
            seenRef.current.add(k);
            fresh.push(item);
          }
          setItems((prev) => (reset ? fresh : [...prev, ...fresh]));
          setTotal(json.total ?? 0);
          setHasMore(!!json.hasMore);
          setNextStart(json.nextStart ?? start + display);
        }
      } catch {
        if (!controller.signal.aborted) {
          setLoadError("Network error. Please try again in a moment.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [query, nextStart, sort, isAli]
  );

  useEffect(() => {
    const timer = setTimeout(() => load(true), 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort, shopSource]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          void load(false);
        }
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loading, load]);

  const capped = isAli ? total : Math.min(total, REACHABLE_CEILING);

  const categoriesUnlocked =
    keyword.trim().length > 0 || category !== "all" || categoriesExpanded;

  useEffect(() => {
    if (!keyword.trim() && category === "all") {
      setCategoriesExpanded(false);
    }
  }, [keyword, category]);

  const activeSortLabel =
    APP_MARKET.sortOptions.find((o) => o.key === sort)?.label ?? "Relevance";

  return (
    <>
      <header className="flex flex-col gap-3 border-b border-outline-variant/40 pb-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] tracking-[0.2em] text-on-surface-variant uppercase">
            Shop
          </p>
          <div className="flex gap-1">
            {APP_MARKET.shopSources.map((src) => (
              <button
                key={src.key}
                type="button"
                data-active={shopSource === src.key}
                className="chip-filter"
                onClick={() => setShopSource(src.key)}
              >
                {src.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[12px] leading-snug text-on-surface-variant">
          {sourceMeta?.description}
        </p>

        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
          >
            <SparklesIcon className="h-4 w-4 opacity-40" />
          </span>
          <input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Brand, style, or price range…"
            className="ai-search-field h-11 w-full pl-11 pr-5 text-[14px] placeholder:text-on-surface-variant"
            aria-label="Shop search"
          />
        </div>

        {!categoriesUnlocked ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-active={category === "all"}
              className="chip-filter"
              onClick={() => setCategory("all")}
            >
              All
            </button>
            <button
              type="button"
              className="chip-filter text-on-surface-variant"
              onClick={() => setCategoriesExpanded(true)}
            >
              More categories
            </button>
          </div>
        ) : (
          <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-0.5">
            {APP_MARKET.categories.map((c) => (
              <button
                key={c.key}
                type="button"
                data-active={category === c.key}
                className="chip-filter shrink-0"
                onClick={() => setCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="mt-4 flex items-center justify-between gap-3 text-[11px] tracking-[0.22em]">
        <span className="min-w-0 truncate text-on-surface-variant">
          {query ? (
            <>
              {isBrowseFeed ? (
                <span className="mr-2 text-on-surface-variant/90">Featured</span>
              ) : null}
              <span className="font-semibold text-on-surface">{capped}</span>
              {total > REACHABLE_CEILING ? "+" : ""} ITEMS
            </>
          ) : (
            "Search or open categories"
          )}
        </span>
        <label className="flex shrink-0 items-center gap-1.5 text-[10px] tracking-[0.18em] text-on-surface-variant uppercase">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(e) => setSort(parseSortKey(e.target.value))}
            aria-label={`Sort: ${activeSortLabel}`}
            className="max-w-[6.5rem] cursor-pointer border-0 bg-transparent py-0 pl-0 pr-4 text-[10px] font-medium tracking-[0.14em] text-on-surface focus:outline-none"
          >
            {APP_MARKET.sortOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="pt-5">
        {loadError ? (
          <p
            className="rounded-sm border border-error/40 bg-error-container px-4 py-6 text-center text-[13px] text-on-error-container"
            role="alert"
          >
            {loadError}
          </p>
        ) : items.length === 0 && !loading && query ? (
          <p className="py-16 text-center text-[13px] text-on-surface-variant">
            No results found.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
            {items.map((p, i) => (
              <ProductCard
                key={productDedupeKey(p)}
                product={p}
                priority={i === 0}
              />
            ))}
          </div>
        )}

        {loading && (
          <p className="mt-8 text-center text-[11px] tracking-[0.22em] text-on-surface-variant">
            LOADING…
          </p>
        )}

        <div ref={sentinelRef} className="h-10" />
      </section>
    </>
  );
}

function SearchBody() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<SearchMode>(() =>
    parseMode(searchParams.get("mode"))
  );

  useEffect(() => {
    setMode(parseMode(searchParams.get("mode")));
  }, [searchParams]);

  const setSearchMode = useCallback(
    (next: SearchMode) => {
      setMode(next);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "ai") {
        params.set("mode", "ai");
      } else {
        params.delete("mode");
        if (next === "shop" && !params.get("q")) {
          // keep other shop params
        }
      }
      const qs = params.toString();
      const target = qs ? `/search?${qs}` : "/search";
      const current = searchParams.toString();
      const currentPath = current ? `/search?${current}` : "/search";
      if (target === currentPath) return;
      router.replace(target, { scroll: false });
    },
    [router, searchParams]
  );

  if (mode === "ai") {
    return (
      <main className="theme-dark min-h-[100dvh]">
        <StyleLabScreen />
        <div className="fixed bottom-20 left-1/2 z-30 -translate-x-1/2 lg:bottom-6">
          <button
            type="button"
            onClick={() => setSearchMode("shop")}
            className="rounded-full border border-[rgba(57,255,122,0.15)] bg-[#0a1009]/95 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#5a7060] backdrop-blur"
          >
            Shop search
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <TopBar title="Search" showBack showStatusStrip={false} />

      <section className="px-5 pt-6">
        <SearchModeTabs mode={mode} onChange={setSearchMode} />
        <div className="mt-5">
          <ShopSearchPanel />
        </div>
      </section>

      <div className="h-20" />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50dvh] items-center justify-center">
          <span className="eyebrow">Loading</span>
        </div>
      }
    >
      <SearchBody />
    </Suspense>
  );
}
