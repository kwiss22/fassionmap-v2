"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { productDedupeKey } from "@/lib/product";
import { useHomeFeed } from "@/lib/hooks/use-home-feed";

/**
 * 홈 에디토리얼 티저 — 브랜드 감도만 유지, 1테마 + 소수 아이템
 * (Maison / Brand index / Atlas 는 /brands 로 이동)
 */
export function EditorialTeaserSection() {
  const { sections } = useHomeFeed();
  const theme = sections.find((s) => s.section.id === "theme-cashmere");
  const items = (theme?.items ?? []).slice(0, 3);
  const loading = theme?.loading ?? true;

  return (
    <section className="border-t border-outline-variant/70 bg-surface-bright/30 px-5 py-10 lg:px-10 lg:py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">THIS WEEK&apos;S EDIT</p>
          <h2 className="editorial-display mt-2 text-[26px] leading-tight">
            From the <em className="italic">brands</em>
          </h2>
          <p className="mt-2 text-[13px] text-on-surface-variant">
            브랜드 큐레이션은 홈이 아닌 Brands에서 깊게 탐색하세요.
          </p>
        </div>
        <Link href="/brands" className="eyebrow-bold shrink-0 underline-link">
          Brands →
        </Link>
      </div>

      {theme && (
        <p className="mt-4 text-[12px] text-on-surface-variant">
          {theme.section.subtitle ?? theme.section.title}
        </p>
      )}

      {loading && items.length === 0 ? (
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="silhouette-bg aspect-[4/5] animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="mt-6 text-[13px] text-on-surface-variant">
          이번 주 에디트를 준비 중입니다.
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-3 gap-3">
          {items.map((product, i) => (
            <ProductCard
              key={productDedupeKey(product)}
              product={product}
              priority={i === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
