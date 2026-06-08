"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
import { AiCuratePanel } from "@/components/search/AiCuratePanel";
import { AIChip } from "@/components/ui/AIChip";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { TopBar } from "@/components/layout/TopBar";
import { productDedupeKey, type Product } from "@/lib/product";
import {
  NAVER_SHOP_DISPLAY_MAX,
  NAVER_SHOP_START_MAX,
  parseSortKey,
  type SortKey,
} from "@/lib/api";
import { cn } from "@/lib/utils";

const fixedCategories = [
  "전체",
  "의류",
  "아우터",
  "가방",
  "신발",
  "액세서리",
  "주얼리",
  "선글라스",
  "향수",
] as const;
type CategoryKey = (typeof fixedCategories)[number];

type SearchMode = "shop" | "ai";
type ShopSource = "naver" | "ali";

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "sim", label: "정확도" },
  { key: "date", label: "최신" },
  { key: "asc", label: "가격↑" },
  { key: "dsc", label: "가격↓" },
];

const PAGE_SIZE = 40;
const REACHABLE_CEILING =
  NAVER_SHOP_START_MAX - 1 + Math.min(PAGE_SIZE, NAVER_SHOP_DISPLAY_MAX);

/** 키워드 없이 「전체」 탭일 때 보여 줄 기본 탐색 쿼리 */
const DEFAULT_BROWSE_QUERY = "여성 패션";
const DEFAULT_ALI_BROWSE_QUERY = "women fashion";

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

function parseCategory(value: string | null): CategoryKey {
  if (!value) return "전체";
  return (fixedCategories as readonly string[]).includes(value)
    ? (value as CategoryKey)
    : "전체";
}

function parseMode(value: string | null): SearchMode {
  return value === "ai" ? "ai" : "shop";
}

function parseShopSource(value: string | null): ShopSource {
  return value === "ali" ? "ali" : "naver";
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
      aria-label="검색 모드"
    >
      {(
        [
          { key: "shop" as const, label: "쇼핑 검색" },
          { key: "ai" as const, label: "AI 큐레이션" },
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
    parseShopSource(searchParams.get("src"))
  );
  const [keyword, setKeyword] = useState(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<CategoryKey>(
    parseCategory(searchParams.get("c"))
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

  const abortRef = useRef<AbortController | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  const isBrowseFeed = !keyword.trim() && category === "전체";
  const isAli = shopSource === "ali";

  const query = useMemo(() => {
    const t = keyword.trim();
    if (!t) {
      if (category !== "전체") return "";
      return isAli ? DEFAULT_ALI_BROWSE_QUERY : DEFAULT_BROWSE_QUERY;
    }
    return category === "전체" ? t : `${t} ${category}`;
  }, [keyword, category, isAli]);

  useEffect(() => {
    setShopSource(parseShopSource(searchParams.get("src")));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("mode", "shop");
    if (shopSource === "ali") params.set("src", "ali");
    if (keyword.trim()) params.set("q", keyword.trim());
    if (category !== "전체") params.set("c", category);
    if (sort !== "sim") params.set("sort", sort);
    const qs = params.toString();
    router.replace(`/search?${qs}`);
  }, [keyword, category, sort, shopSource, router]);

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
                `알리 API 오류 (${res.status}). .env.local의 ALIEXPRESS_APP_KEY/SECRET을 확인하세요.`
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
                `검색 API 오류 (${res.status}). .env.local의 NAVER_CLIENT_ID/SECRET을 확인하세요.`
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
          setLoadError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
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

  return (
    <>
      <header className="mb-5 flex flex-col gap-3">
        <AIChip>쇼핑 검색</AIChip>
        <p className="max-w-md text-[13px] leading-relaxed text-on-surface-variant">
          {isAli
            ? "AliExpress 어필리에이트 데이터로 상품을 검색합니다. 가격은 KRW 기준으로 표시됩니다."
            : "전체 탭에서는 추천 상품을 바로 보여 드립니다. 키워드를 입력하면 네이버 쇼핑 결과를 좁혀 검색합니다."}
        </p>
        <div className="flex gap-1">
          {(
            [
              { key: "naver" as const, label: "네이버" },
              { key: "ali" as const, label: "AliExpress" },
            ] as const
          ).map((src) => (
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
      </header>

      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
        >
          <SparklesIcon className="h-4 w-4 opacity-40" />
        </span>
        <input
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="브랜드·스타일·가격대를 입력해 보세요…"
          className="ai-search-field h-12 w-full pl-11 pr-5 text-[14px] placeholder:text-on-surface-variant"
          aria-label="쇼핑 검색"
        />
      </div>

      <div className="hide-scrollbar -mx-5 mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {fixedCategories.map((c) => (
          <button
            key={c}
            type="button"
            data-active={category === c}
            className="chip-filter"
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between text-[11px] tracking-[0.22em]">
        <span className="text-on-surface-variant">
          {query ? (
            <>
              {isBrowseFeed ? (
                <span className="mr-2 text-on-surface-variant/90">추천</span>
              ) : null}
              <span className="font-semibold text-on-surface">{capped}</span>
              {total > REACHABLE_CEILING ? "+" : ""} ITEMS
            </>
          ) : (
            "카테고리를 선택하거나 키워드를 입력하세요"
          )}
        </span>
        <div className="flex gap-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              type="button"
              data-active={sort === opt.key}
              className="chip-filter"
              onClick={() => setSort(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <section className="pt-6">
        {loadError ? (
          <p
            className="rounded-sm border border-error/40 bg-error-container px-4 py-6 text-center text-[13px] text-on-error-container"
            role="alert"
          >
            {loadError}
          </p>
        ) : items.length === 0 && !loading && query ? (
          <p className="py-16 text-center text-[13px] text-on-surface-variant">
            결과가 없습니다.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
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
      router.replace(qs ? `/search?${qs}` : "/search");
    },
    [router, searchParams]
  );

  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <TopBar title="Search" showStatusStrip={false} />

      <section className="px-5 pt-6">
        <SearchModeTabs mode={mode} onChange={setSearchMode} />
        <div className="mt-6">
          {mode === "ai" ? (
            <AiCuratePanel
              initialPrompt={searchParams.get("q") ?? ""}
              autoRun={Boolean(searchParams.get("q")?.trim())}
            />
          ) : (
            <ShopSearchPanel />
          )}
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
