"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useFollow } from "@/lib/hooks/use-follow";
import { getBrandBySlug, type Brand } from "@/lib/brands";
import { productDedupeKey, type Product } from "@/lib/product";
import { ProductCard } from "@/components/ProductCard";
import { NAVER_SHOP_DISPLAY_MAX } from "@/lib/api";

const PAGE_SIZE_PER_BRAND = 8;

type BrandPool = {
  brand: Brand;
  items: Product[];
  cursor: number;
};

/**
 * 팔로우한 브랜드의 상품을 라운드-로빈으로 인터리브해서 보여주는 통합 피드.
 *
 * - 각 팔로우 브랜드 API를 병렬 호출해 풀을 만든다.
 * - 화면에는 1개씩 번갈아 꺼내 하나의 그리드로 노출.
 * - ID 중복은 한 번만 노출 (같은 상품이 여러 브랜드 검색어에 잡힐 수 있음).
 */
export function FollowedFeed() {
  const { items: followed } = useFollow();
  const [pools, setPools] = useState<BrandPool[]>([]);
  const [loading, setLoading] = useState(false);
  const seenRef = useRef<Set<string>>(new Set());

  const followedSlugs = useMemo(
    () => followed.map((b) => b.slug).sort().join("|"),
    [followed]
  );

  const load = useCallback(async () => {
    if (followed.length === 0) {
      setPools([]);
      seenRef.current = new Set();
      return;
    }
    setLoading(true);
    seenRef.current = new Set();
    const brands = followed
      .map((f) => getBrandBySlug(f.slug))
      .filter((b): b is Brand => !!b);

    const display = Math.min(PAGE_SIZE_PER_BRAND * 2, NAVER_SHOP_DISPLAY_MAX);
    try {
      const results = await Promise.all(
        brands.map(async (brand) => {
          try {
            const res = await fetch(
              `/api/naver-products?query=${encodeURIComponent(brand.query)}&start=1&display=${display}&sort=sim`,
              { cache: "no-store" }
            );
            const json = (await res.json()) as { items?: Product[] };
            const fresh: Product[] = [];
            for (const item of json.items ?? []) {
              const k = productDedupeKey(item);
              if (seenRef.current.has(k)) continue;
              seenRef.current.add(k);
              fresh.push(item);
              if (fresh.length >= PAGE_SIZE_PER_BRAND) break;
            }
            return { brand, items: fresh, cursor: 0 } satisfies BrandPool;
          } catch {
            return { brand, items: [], cursor: 0 } satisfies BrandPool;
          }
        })
      );
      setPools(results.filter((p) => p.items.length > 0));
    } finally {
      setLoading(false);
    }
    // `followed` 배열은 매 호출마다 새 참조지만 slugs 문자열로 안정화.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [followedSlugs]);

  useEffect(() => {
    void load();
  }, [load]);

  // 라운드-로빈으로 인터리브: [p0_a, p0_b, p0_c, p1_a, p1_b, ...]
  const merged = useMemo(() => {
    const out: Product[] = [];
    if (pools.length === 0) return out;
    const maxLen = Math.max(...pools.map((p) => p.items.length));
    for (let i = 0; i < maxLen; i++) {
      for (const pool of pools) {
        const item = pool.items[i];
        if (item) out.push(item);
      }
    }
    return out;
  }, [pools]);

  /** 풀 단위 dedupe 후에도 id·링크 기준으로 한 번 더 정리. */
  const displayItems = useMemo(() => {
    const seen = new Set<string>();
    const out: Product[] = [];
    for (const p of merged) {
      const k = productDedupeKey(p);
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(p);
    }
    return out;
  }, [merged]);

  if (loading && pools.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 px-5 py-6 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] w-full animate-pulse bg-surface-container"
          />
        ))}
      </div>
    );
  }

  if (displayItems.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="editorial-serif text-[22px] italic">
          No items to show yet.
        </p>
        <p className="mt-2 text-[13px] text-on-surface-variant">
          팔로우한 브랜드에 노출할 상품이 없어요. 잠시 후 다시 시도해 주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="px-5 pb-6 pt-2">
      <div className="mb-4 flex items-center justify-between text-[11px] tracking-[0.22em] text-on-surface-variant">
        <span className="eyebrow-bold">
          {displayItems.length}{" "}
          {displayItems.length === 1 ? "ITEM" : "ITEMS"}
        </span>
        <Link href="/feed/discover" className="underline-link eyebrow-bold">
          DISCOVER →
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
        {displayItems.map((product) => (
          <ProductCard
            key={productDedupeKey(product)}
            product={product}
          />
        ))}
      </div>
    </div>
  );
}
