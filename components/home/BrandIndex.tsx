"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  HOME_FEED_SECTIONS,
  HOME_FEED_SECTION_SIZE,
  type HomeFeedSectionDef,
} from "@/lib/home-feed";
import { resolveHomeBrands } from "@/lib/brands";
import { productDedupeKey, type Product } from "@/lib/product";
import { ProductCard } from "@/components/ProductCard";
import { FollowButton } from "@/components/ui/FollowButton";
import { NAVER_SHOP_DISPLAY_MAX } from "@/lib/api";

type SectionState = {
  def: HomeFeedSectionDef;
  items: Product[];
};

const INITIAL = 2;

/** 섹션 헤더의 query 문자열로부터 브랜드 slug를 역으로 찾아두기 위한 맵. */
const BRAND_SLUG_BY_QUERY = new Map(
  resolveHomeBrands().map((b) => [b.query, b.slug])
);

/**
 * 브랜드 인덱스: 섹션당 브랜드 하나씩, 무한 스크롤로 다음 섹션을 이어 붙인다.
 *
 * 기존 `app/page.tsx` 홈 모드 로직의 핵심만 이 컴포넌트로 뽑아낸 버전.
 * 카테고리 필터는 이번 라운드에서 제거 — 필터링은 /search 쪽에서 전담.
 */
export function BrandIndex() {
  const [sections, setSections] = useState<SectionState[]>([]);
  const [exhausted, setExhausted] = useState(false);
  const nextIdxRef = useRef(0);
  const seenRef = useRef<Set<string>>(new Set());
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadNext = useCallback(async () => {
    if (loadingRef.current || exhausted) return;
    const idx = nextIdxRef.current;
    if (idx >= HOME_FEED_SECTIONS.length) {
      setExhausted(true);
      return;
    }
    loadingRef.current = true;
    nextIdxRef.current = idx + 1;
    const def = HOME_FEED_SECTIONS[idx];

    try {
      const display = Math.min(
        HOME_FEED_SECTION_SIZE * 2,
        NAVER_SHOP_DISPLAY_MAX
      );
      const res = await fetch(
        `/api/naver-products?query=${encodeURIComponent(def.keyword)}&start=1&display=${display}&sort=sim`,
        { cache: "no-store" }
      );
      const json = (await res.json()) as { items?: Product[] };
      const fresh: Product[] = [];
      for (const item of json.items ?? []) {
        const k = productDedupeKey(item);
        if (seenRef.current.has(k)) continue;
        seenRef.current.add(k);
        fresh.push(item);
        if (fresh.length >= HOME_FEED_SECTION_SIZE) break;
      }
      if (fresh.length > 0) {
        setSections((prev) => [...prev, { def, items: fresh }]);
      } else {
        // 이 브랜드는 거의 결과가 없으니 바로 다음 섹션으로
        loadingRef.current = false;
        await loadNext();
        return;
      }
    } catch {
      // 섹션 단위 실패는 조용히 스킵
    } finally {
      loadingRef.current = false;
    }
  }, [exhausted]);

  // 초기 N개 섹션 로드
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 0; i < INITIAL; i++) {
        if (cancelled) return;
        await loadNext();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadNext]);

  // 센티넬 무한 스크롤
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadNext();
      },
      { rootMargin: "600px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadNext]);

  return (
    <div>
      {sections.map(({ def, items }) => {
        const slug = BRAND_SLUG_BY_QUERY.get(def.keyword);
        return (
          <section key={def.keyword} className="px-5 py-8">
            <header className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow-bold">{def.labelKo}</p>
                <h3 className="editorial-display mt-1 text-[26px] italic">
                  {def.labelEn}
                </h3>
              </div>
              <div className="flex flex-col items-end gap-2">
                {slug && <FollowButton slug={slug} />}
                <Link
                  href={`/search?q=${encodeURIComponent(def.keyword)}`}
                  className="eyebrow-bold underline-link"
                >
                  VIEW ALL →
                </Link>
              </div>
            </header>
            <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((product) => (
                <ProductCard
                  key={productDedupeKey(product)}
                  product={product}
                />
              ))}
            </div>
          </section>
        );
      })}

      <div ref={sentinelRef} className="h-10" />

      {exhausted && (
        <p className="pb-10 pt-4 text-center text-[11px] tracking-[0.22em] text-on-surface-variant">
          END OF INDEX · VOL 07
        </p>
      )}
    </div>
  );
}
