"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/ProductCard";
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

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "sim", label: "정확도" },
  { key: "date", label: "최신" },
  { key: "asc", label: "가격↑" },
  { key: "dsc", label: "가격↓" },
];

const PAGE_SIZE = 40;
const REACHABLE_CEILING =
  NAVER_SHOP_START_MAX - 1 + Math.min(PAGE_SIZE, NAVER_SHOP_DISPLAY_MAX);

type SearchResponse = {
  items?: Product[];
  total?: number;
  hasMore?: boolean;
  nextStart?: number;
  error?: string;
};

function parseCategory(value: string | null): CategoryKey {
  if (!value) return "전체";
  return (fixedCategories as readonly string[]).includes(value)
    ? (value as CategoryKey)
    : "전체";
}

function SearchBody() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

  const abortRef = useRef<AbortController | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  const query = useMemo(() => {
    const t = keyword.trim();
    if (!t) return "";
    return category === "전체" ? t : `${t} ${category}`;
  }, [keyword, category]);

  // URL sync (q/c/sort)
  useEffect(() => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.set("q", keyword.trim());
    if (category !== "전체") params.set("c", category);
    if (sort !== "sim") params.set("sort", sort);
    const qs = params.toString();
    router.replace(qs ? `/search?${qs}` : "/search");
  }, [keyword, category, sort, router]);

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
      }

      const start = reset ? 1 : nextStart;
      const display = Math.min(PAGE_SIZE, NAVER_SHOP_DISPLAY_MAX);

      try {
        const url = `/api/naver-products?query=${encodeURIComponent(query)}&start=${start}&display=${display}&sort=${sort}`;
        const res = await fetch(url, { signal: controller.signal });
        const json = (await res.json()) as SearchResponse;
        if (controller.signal.aborted) return;
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
      } catch {
        // 네트워크 오류는 조용히
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    },
    [query, nextStart, sort]
  );

  // keyword/category/sort 변경 시 reset load
  useEffect(() => {
    const timer = setTimeout(() => load(true), 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, sort]);

  // 센티넬
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

  const capped = Math.min(total, REACHABLE_CEILING);

  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <TopBar title="Search" showStatusStrip={false} />

      <section className="px-5 pt-6">
        <header className="mb-5 flex flex-col gap-2">
          <AIChip>큐레이션 검색</AIChip>
          <p className="max-w-md text-[13px] leading-relaxed text-on-surface-variant">
            브랜드·스타일·가격대를 한 줄로 적어도 됩니다. 네이버 쇼핑 결과를 모아
            보여 드립니다.
          </p>
        </header>

        <div className="relative">
          <span
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-ai)]"
          >
            <SparklesIcon className="h-4 w-4" />
          </span>
          <input
            type="search"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="브랜드·스타일·가격대를 입력해 보세요…"
            className="ai-search-field h-12 w-full pl-11 pr-5 text-[14px] placeholder:text-on-surface-variant"
            aria-label="AI 검색"
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
                <span className="font-semibold text-on-surface">{capped}</span>
                {total > REACHABLE_CEILING ? "+" : ""} ITEMS
              </>
            ) : (
              "키워드를 입력하세요"
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
      </section>

      <section className="px-5 pb-20 pt-6">
        {items.length === 0 && !loading && query ? (
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
