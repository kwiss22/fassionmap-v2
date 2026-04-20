"use client";

import { ProductCard } from "@/components/ProductCard";
import { Suspense, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { type Product } from "@/lib/product";
import Link from "next/link";

const fixedCategories = ["전체", "상의", "하의", "신발", "액세서리"] as const;

function parseCategoryParam(value: string | null): (typeof fixedCategories)[number] {
  if (!value) {
    return "전체";
  }
  return (fixedCategories as readonly string[]).includes(value)
    ? (value as (typeof fixedCategories)[number])
    : "전체";
}

function HomeSearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [keyword, setKeyword] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<(typeof fixedCategories)[number]>("전체");
  const [apiProducts, setApiProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const q = searchParams.get("q") ?? "";
    const cat = parseCategoryParam(searchParams.get("cat"));
    setKeyword(q);
    setSelectedCategory(cat);
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
    const desiredQ = params.get("q");
    const desiredCat = params.get("cat");
    const currentQ = searchParams.get("q");
    const currentCat = searchParams.get("cat");
    const qChanged = (desiredQ ?? "") !== (currentQ ?? "");
    const catChanged = (desiredCat ?? "") !== (currentCat ?? "");
    if (!qChanged && !catChanged) {
      return;
    }
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [trimmedKeyword, selectedCategory, pathname, router, searchParams]);

  const hasQuery = finalQuery.length > 0;

  useEffect(() => {
    if (!finalQuery) {
      setApiProducts([]);
      setFetchError(null);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        setFetchError(null);

        const response = await fetch(
          `/api/naver-products?query=${encodeURIComponent(finalQuery)}`,
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = (await response.json()) as {
          items?: Product[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(
            data.error ?? "네이버 상품 데이터를 가져오지 못했습니다."
          );
        }

        setApiProducts(data.items ?? []);
      } catch (error) {
        setApiProducts([]);
        setFetchError(
          error instanceof Error
            ? error.message
            : "알 수 없는 에러가 발생했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [finalQuery]);

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
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-on-surface-variant">
              {hasQuery ? `총 ${apiProducts.length}개 상품` : "검색어를 입력하세요."}
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
              카테고리만 선택하거나 검색어를 입력하면 네이버 쇼핑 결과를 불러옵니다.
            </div>
          ) : isLoading ? (
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
              {apiProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {hasQuery && !isLoading && apiProducts.length === 0 && !fetchError ? (
            <div className="mt-8 border border-dashed border-outline-variant p-8 text-center text-sm text-secondary">
              검색 결과가 없습니다.
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
