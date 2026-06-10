"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { productDedupeKey } from "@/lib/product";
import { useHomeFeed } from "@/lib/hooks/use-home-feed";

/**
 * 홈 브랜드 에딧 — 상품 그리드 중심, 대표 이미지 + 썸네일 열.
 */
export function EditorialTeaserSection() {
  const { sections } = useHomeFeed();
  const theme = sections.find((s) => s.section.id === "theme-cashmere");
  const items = (theme?.items ?? []).slice(0, 3);
  const loading = theme?.loading ?? true;
  const hero = items[0];
  const thumbs = items.slice(1);

  return (
    <section className="border-t border-outline-variant/30 bg-surface-bright/30 px-5 py-16 lg:px-10 lg:py-24">
      <div className="flex items-center justify-between gap-4 border-b border-on-surface/10 pb-4">
        <span className="text-[11px] font-medium tracking-[0.26em] text-on-surface">
          {theme?.section.eyebrow ?? "THIS WEEK'S EDIT"}
        </span>
        <Link
          href="/brands"
          className="text-[11px] tracking-[0.22em] text-on-surface-variant uppercase underline-link"
        >
          Brands →
        </Link>
      </div>

      <h2 className="mt-6 font-playfair text-[24px] leading-tight text-on-surface sm:text-[28px]">
        {theme?.section.title ?? "The cashmere edit"}
      </h2>
      {theme?.section.subtitle ? (
        <p className="mt-2 max-w-lg text-[13px] text-on-surface-variant">
          {theme.section.subtitle}
        </p>
      ) : null}

      {loading && items.length === 0 ? (
        <div className="mt-8 grid grid-cols-12 gap-4 lg:gap-6">
          <div className="silhouette-bg col-span-12 aspect-[4/5] animate-pulse sm:col-span-7" />
          <div className="col-span-12 flex flex-col gap-4 sm:col-span-5">
            <div className="silhouette-bg aspect-[4/5] animate-pulse" />
            <div className="silhouette-bg aspect-[4/5] animate-pulse" />
          </div>
        </div>
      ) : items.length === 0 ? (
        <p className="mt-8 text-[13px] text-on-surface-variant">
          This week&apos;s edit is on the way.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-12 gap-4 lg:mt-10 lg:gap-6">
          {hero ? (
            <div className="col-span-12 sm:col-span-7">
              <ProductCard
                key={productDedupeKey(hero)}
                product={hero}
                priority
              />
            </div>
          ) : null}
          {thumbs.length > 0 ? (
            <div className="col-span-12 flex flex-col gap-4 sm:col-span-5 sm:gap-5">
              {thumbs.map((product) => (
                <ProductCard
                  key={productDedupeKey(product)}
                  product={product}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
