"use client";

import { ProductCard } from "@/components/ProductCard";
import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
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

  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryKey>("전체");
  const [sort, setSort] = useState<SortKey>("sim");

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [nextStart, setNextStart] = useState(1);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const q = searchParams.get("q") ?? "";
    const cat = parseCategoryParam(searchParams.get("cat"));
    const nextSort = parseSortKey(searchParams.get("sort"));
    setKeyword(q);
    setSelectedCategory(cat);
    setSort(nextSort);
  }, [searchParams]);

  const trimmedKeyword = keyword.trim();
  const finalQuery = useMemo(() => {
    const categoryText = selectedCategory === "전체" ? "" : selectedCategory;
    const combined = [trimmedKeyword, categoryText].filter(Boolean).join(" ");
    return combined.trim();
  }, [trimmedKeyword, selectedCategory]);

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
    const desiredQ = params.get("q");
    const desiredCat = params.get("cat");
    const desiredSort = params.get("sort");
    const currentQ = searchParams.get("q");
    const currentCat = searchParams.get("cat");
    const currentSort = searchParams.get("sort");
    const qChanged = (desiredQ ?? "") !== (currentQ ?? "");
    const catChanged = (desiredCat ?? "") !== (currentCat ?? "");
    const sortChanged = (desiredSort ?? "") !== (currentSort ?? "");
    if (!qChanged && !catChanged && !sortChanged) {
      return;
    }
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [trimmedKeyword, selectedCategory, sort, pathname, router, searchParams]);

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

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-outline-variant bg-surface/95 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between gap-4">
          <Link
            href="/"
            className="font-newsreader text-xl font-medium italic text-primary"
          >
            패션맵
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-6 pb-16 pt-8">
        <section className="mb-8 space-y-4">
          <div className="space-y-2">
            <h1 className="font-newsreader text-3xl text-primary md:text-4xl">
              쇼핑 검색
            </h1>
            <p className="text-sm text-secondary">
              검색 후 상품을 눌러 상세에서 제휴 링크로 이동할 수 있습니다.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="상품명으로 검색"
              aria-label="상품 검색"
            />
            <Button
              variant="outline"
              onClick={() => {
                setKeyword("");
                setSelectedCategory("전체");
                setSort("sim");
                router.replace(pathname, { scroll: false });
              }}
            >
              초기화
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {fixedCategories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <Button
                  key={category}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              );
            })}
          </div>

          <div
            className="flex flex-wrap items-center gap-2"
            role="radiogroup"
            aria-label="정렬 기준"
          >
            <span className="mr-1 text-xs uppercase tracking-wider text-on-surface-variant">
              정렬
            </span>
            {sortOptions.map((option) => {
              const isActive = sort === option.key;
              return (
                <Button
                  key={option.key}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setSort(option.key)}
                  role="radio"
                  aria-checked={isActive}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">
              {hasQuery
                ? total > 0
                  ? `${items.length.toLocaleString("ko-KR")} / ${total.toLocaleString("ko-KR")}개 표시 중`
                  : `총 ${items.length}개 상품`
                : "검색어를 입력하세요."}
            </p>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-on-surface-variant">
                <span className="h-3 w-3 animate-spin rounded-full border border-outline border-t-primary" />
                검색 중...
              </div>
            ) : null}
          </div>

          {fetchError ? (
            <div className="mb-4 border border-dashed border-error p-3 text-sm text-error">
              {fetchError}
            </div>
          ) : null}

          {!hasQuery ? (
            <div className="border border-dashed border-outline-variant p-8 text-center text-sm text-secondary">
              카테고리만 선택하거나 검색어를 입력하면 네이버 쇼핑 결과를
              불러옵니다.
            </div>
          ) : isLoading && items.length === 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <article
                  key={`skeleton-${index}`}
                  className="overflow-hidden border border-outline-variant bg-surface"
                >
                  <div className="aspect-[4/5] w-full animate-pulse bg-surface-container" />
                  <div className="space-y-2 p-4">
                    <div className="h-5 w-16 animate-pulse bg-surface-container" />
                    <div className="h-5 w-3/4 animate-pulse bg-surface-container" />
                    <div className="h-4 w-1/3 animate-pulse bg-surface-container" />
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {hasQuery && !isLoading && items.length === 0 && !fetchError ? (
            <div className="mt-8 border border-dashed border-outline-variant p-8 text-center text-sm text-secondary">
              검색 결과가 없습니다.
            </div>
          ) : null}

          {hasQuery && items.length > 0 ? (
            <div
              ref={sentinelRef}
              aria-hidden="true"
              className="mt-8 flex h-16 items-center justify-center text-sm text-on-surface-variant"
            >
              {isLoadingMore ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border border-outline border-t-primary" />
                  더 불러오는 중...
                </span>
              ) : hasMore ? (
                <span className="text-xs uppercase tracking-wider">
                  스크롤하여 더 보기
                </span>
              ) : (
                <span className="text-xs uppercase tracking-wider text-secondary">
                  마지막 결과입니다
                </span>
              )}
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-screen-xl px-6 pb-16 pt-8">
          <div className="h-10 w-48 animate-pulse rounded bg-surface-container" />
          <div className="mt-6 h-10 w-full animate-pulse rounded bg-surface-container" />
        </div>
      }
    >
      <HomeSearchContent />
    </Suspense>
  );
}
