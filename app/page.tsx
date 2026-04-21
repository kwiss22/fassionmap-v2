"use client";

import { ProductCard } from "@/components/ProductCard";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { NAVER_SHOP_START_MAX, NAVER_SHOP_DISPLAY_MAX } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { type Product } from "@/lib/product";
import { parseSortKey, type SortKey } from "@/lib/api";
import Link from "next/link";

const fixedCategories = ["전체", "상의", "하의", "신발", "액세서리"] as const;

type CategoryKey = (typeof fixedCategories)[number];

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "sim", label: "정확도순" },
  { key: "date", label: "최신순" },
  { key: "asc", label: "가격 낮은순" },
  { key: "dsc", label: "가격 높은순" },
];

const PAGE_SIZE = 40;

// 네이버 쇼핑 API는 start > 1000을 허용하지 않으므로,
// 실제로 도달 가능한 상한은 (start 상한 - 1) + display 만큼이다.
const REACHABLE_CEILING =
  NAVER_SHOP_START_MAX - 1 + Math.min(PAGE_SIZE, NAVER_SHOP_DISPLAY_MAX);

function parseCategoryParam(value: string | null): CategoryKey {
  if (!value) {
    return "전체";
  }
  return (fixedCategories as readonly string[]).includes(value)
    ? (value as CategoryKey)
    : "전체";
}

type SearchPageResponse = {
  items?: Product[];
  total?: number;
  hasMore?: boolean;
  nextStart?: number;
  error?: string;
};

function HomeSearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL은 mount 시점에만 한 번 읽는다. 이후는 state가 source of truth.
  // (useEffect로 양방향 바인딩하면 router.replace가 searchParams 참조를 갱신하면서
  //  effect 재실행 → 기본값 reset → 다시 replace 사이클이 생길 수 있음)
  const [keyword, setKeyword] = useState(
    () => searchParams.get("q") ?? ""
  );
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(() =>
    parseCategoryParam(searchParams.get("cat"))
  );
  const [sort, setSort] = useState<SortKey>(() =>
    parseSortKey(searchParams.get("sort"))
  );

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextStart, setNextStart] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const trimmedKeyword = keyword.trim();
  const finalQuery = useMemo(() => {
    const categoryText = selectedCategory === "전체" ? "" : selectedCategory;
    const combined = [trimmedKeyword, categoryText].filter(Boolean).join(" ");
    return combined.trim();
  }, [trimmedKeyword, selectedCategory]);

  // state → URL 단방향 sync. searchParams는 deps에 넣지 않는다.
  // 비교는 마지막으로 우리가 쓴 URL과 하여, router.replace가 재실행 유발 시에도 멱등.
  const lastWrittenUrlRef = useRef<string | null>(null);
  useEffect(() => {
    const params = new URLSearchParams();
    if (trimmedKeyword) {
      params.set("q", trimmedKeyword);
    }
    if (selectedCategory !== "전체") {
      params.set("cat", selectedCategory);
    }
    if (sort !== "sim") {
      params.set("sort", sort);
    }
    const qs = params.toString();
    const nextUrl = qs ? `${pathname}?${qs}` : pathname;
    if (lastWrittenUrlRef.current === nextUrl) {
      return;
    }
    lastWrittenUrlRef.current = nextUrl;
    router.replace(nextUrl, { scroll: false });
  }, [trimmedKeyword, selectedCategory, sort, pathname, router]);

  const hasQuery = finalQuery.length > 0;

  useEffect(() => {
    if (!finalQuery) {
      setItems([]);
      setTotal(0);
      setHasMore(false);
      setNextStart(1);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setFetchError(null);
        setItems([]);
        setHasMore(false);
        setNextStart(1);
        setTotal(0);

        const url =
          `/api/naver-products?query=${encodeURIComponent(finalQuery)}` +
          `&start=1&display=${PAGE_SIZE}&sort=${sort}`;

        const response = await fetch(url, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = (await response.json()) as SearchPageResponse;

        if (controller.signal.aborted) {
          return;
        }

        if (!response.ok) {
          throw new Error(
            data.error ?? "네이버 상품 데이터를 가져오지 못했습니다."
          );
        }

        setItems(data.items ?? []);
        setTotal(data.total ?? 0);
        setHasMore(Boolean(data.hasMore));
        setNextStart(data.nextStart ?? 1);
      } catch (error) {
        if ((error as { name?: string })?.name === "AbortError") {
          return;
        }
        setItems([]);
        setTotal(0);
        setHasMore(false);
        setFetchError(
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생했습니다."
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [finalQuery, sort]);

  const loadMore = useCallback(async () => {
    if (!finalQuery || !hasMore || isLoading || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const url =
        `/api/naver-products?query=${encodeURIComponent(finalQuery)}` +
        `&start=${nextStart}&display=${PAGE_SIZE}&sort=${sort}`;

      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
      });

      const data = (await response.json()) as SearchPageResponse;

      if (!response.ok) {
        throw new Error(
          data.error ?? "다음 페이지를 불러오지 못했습니다."
        );
      }

      setItems((prev) => {
        const seen = new Set(prev.map((product) => product.id));
        const fresh = (data.items ?? []).filter(
          (product) => !seen.has(product.id)
        );
        return [...prev, ...fresh];
      });
      setTotal(data.total ?? total);
      setHasMore(Boolean(data.hasMore));
      setNextStart(data.nextStart ?? nextStart);
    } catch (error) {
      setHasMore(false);
      setFetchError(
        error instanceof Error
          ? error.message
          : "알 수 없는 에러가 발생했습니다."
      );
    } finally {
      setIsLoadingMore(false);
    }
  }, [finalQuery, hasMore, isLoading, isLoadingMore, nextStart, sort, total]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMore();
        }
      },
      { rootMargin: "400px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  const capped = Math.min(total, REACHABLE_CEILING);
  const overCeiling = total > REACHABLE_CEILING;
  const resultLabel = !hasQuery
    ? "검색어를 입력하세요"
    : isLoading && items.length === 0
      ? "검색 중"
      : items.length === 0
        ? "결과 없음"
        : `${items.length.toLocaleString("ko-KR")} / ${capped.toLocaleString(
            "ko-KR"
          )}${overCeiling ? "+" : ""}`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-8">
          <Link
            href="/"
            className="font-newsreader text-[22px] italic leading-none tracking-tight text-primary"
          >
            패션맵
          </Link>
          <span className="eyebrow hidden md:inline">
            Curated · Naver Shopping
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-8 pb-24">
        {/* Editorial hero */}
        <section className="border-b border-outline-variant/60 pb-10 pt-16 md:pt-24">
          <p className="eyebrow mb-6">Issue N° 01 — Spring Archive</p>
          <h1 className="editorial-display text-[13vw] leading-[0.9] text-primary md:text-[clamp(4rem,8.4vw,8.5rem)]">
            Everything,<br className="hidden md:block" />
            <span> beautifully </span>
            <span className="text-secondary">found.</span>
          </h1>
          <p className="mt-8 max-w-xl text-[15px] leading-relaxed text-on-surface-variant md:mt-10">
            네이버 쇼핑 인덱스 위에 얹은 에디토리얼 뷰. 키워드와 카테고리로
            좁히고, 마음에 드는 상품을 선택하면 제휴 쇼핑몰로 바로 이어집니다.
          </p>
        </section>

        {/* Search + filters */}
        <section className="sticky top-16 z-30 -mx-8 border-b border-outline-variant/60 bg-surface/90 px-8 py-6 backdrop-blur">
          <div className="flex items-end gap-8 border-b border-outline pb-4">
            <span className="eyebrow shrink-0 pb-2">Search</span>
            <Input
              variant="underline"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Jacket, knit, loafers…"
              aria-label="상품 검색"
              className="border-none px-0 focus-visible:border-none"
            />
            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setSelectedCategory("전체");
                setSort("sim");
              }}
              className="eyebrow shrink-0 pb-2 text-on-surface-variant transition-colors hover:text-primary"
            >
              Reset
            </button>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-4">
            <span className="eyebrow">Category</span>
            <div
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
              role="group"
              aria-label="카테고리 필터"
            >
              {fixedCategories.map((category) => {
                const isActive = selectedCategory === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setSelectedCategory(category)}
                    aria-pressed={isActive}
                    data-active={isActive}
                    className="underline-link text-sm text-on-surface transition-colors data-[active=true]:text-primary"
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <span className="eyebrow ml-auto">Sort</span>
            <div
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
              role="radiogroup"
              aria-label="정렬 기준"
            >
              {sortOptions.map((option) => {
                const isActive = sort === option.key;
                return (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSort(option.key)}
                    role="radio"
                    aria-checked={isActive}
                    data-active={isActive}
                    className="underline-link text-sm text-on-surface transition-colors data-[active=true]:text-primary"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-8 flex items-baseline justify-between border-b border-outline-variant/50 pb-4">
            <p className="eyebrow">Showing</p>
            <p className="font-newsreader text-base italic text-on-surface tabular-nums">
              {resultLabel}
            </p>
          </div>

          {fetchError ? (
            <div className="mb-6 border-y border-error py-4 text-center text-sm tracking-wide text-error">
              {fetchError}
            </div>
          ) : null}

          {!hasQuery ? (
            <div className="flex min-h-[40vh] items-center justify-center border border-dashed border-outline-variant">
              <div className="max-w-md px-6 text-center">
                <p className="eyebrow mb-4">Begin</p>
                <p className="font-newsreader text-2xl italic leading-snug text-primary">
                  검색어를 입력하거나<br />
                  카테고리를 선택해 시작하세요.
                </p>
              </div>
            </div>
          ) : isLoading && items.length === 0 ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={`skeleton-${index}`} className="space-y-3">
                  <div className="aspect-[4/5] w-full animate-pulse bg-surface-container" />
                  <div className="h-3 w-1/3 animate-pulse bg-surface-container" />
                  <div className="h-4 w-3/4 animate-pulse bg-surface-container" />
                  <div className="h-3 w-1/4 animate-pulse bg-surface-container" />
                </div>
              ))}
            </div>
          ) : items.length === 0 && !fetchError ? (
            <div className="flex min-h-[40vh] items-center justify-center border border-dashed border-outline-variant">
              <div className="max-w-md px-6 text-center">
                <p className="eyebrow mb-4">No match</p>
                <p className="font-newsreader text-2xl italic leading-snug text-primary">
                  조건에 맞는 상품을 찾지 못했습니다.
                </p>
                <p className="mt-3 text-sm text-on-surface-variant">
                  다른 키워드로 시도하거나 카테고리를 바꿔보세요.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
              {items.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  // 데스크탑 4열 기준 첫 행(최대 4장)이 LCP 후보에 포함
                  priority={index < 4}
                />
              ))}
            </div>
          )}

          {hasQuery && items.length > 0 ? (
            <div
              ref={sentinelRef}
              aria-hidden="true"
              className="mt-16 flex h-20 items-center justify-center"
            >
              {isLoadingMore ? (
                <span className="eyebrow flex items-center gap-3">
                  <span className="h-[1px] w-8 bg-on-surface-variant animate-pulse" />
                  Loading more
                  <span className="h-[1px] w-8 bg-on-surface-variant animate-pulse" />
                </span>
              ) : hasMore ? (
                <span className="eyebrow">Scroll for more</span>
              ) : (
                <span className="eyebrow text-secondary">
                  End of selection
                </span>
              )}
            </div>
          ) : null}
        </section>

        <footer className="mt-24 border-t border-outline-variant/60 pt-8">
          <div className="flex flex-col items-start justify-between gap-3 text-[11px] tracking-wider text-on-surface-variant md:flex-row md:items-center">
            <span className="font-newsreader text-sm italic text-primary">
              패션맵
            </span>
            <span className="uppercase">
              © {new Date().getFullYear()} · Data by Naver Shopping
            </span>
          </div>
        </footer>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-8 pt-24">
          <div className="h-3 w-32 animate-pulse bg-surface-container" />
          <div className="mt-8 h-24 w-3/4 animate-pulse bg-surface-container" />
          <div className="mt-6 h-4 w-1/2 animate-pulse bg-surface-container" />
        </div>
      }
    >
      <HomeSearchContent />
    </Suspense>
  );
}
