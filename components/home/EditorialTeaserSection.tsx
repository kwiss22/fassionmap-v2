"use client";

import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { productDedupeKey } from "@/lib/product";
import { CURRENT_ISSUE } from "@/lib/editorial";
import { resolveNaverQueriesForSection } from "@/lib/editorial-naver-queries";
import { useNaverProducts } from "@/lib/hooks/use-naver-products";

const THEME_SECTION =
  CURRENT_ISSUE.sections.find((s) => s.id === "theme-cashmere") ??
  CURRENT_ISSUE.sections.find((s) => s.source.type === "theme");

const THEME_QUERIES = THEME_SECTION
  ? resolveNaverQueriesForSection(THEME_SECTION)
  : ["캐시미어 코트"];

/**
 * 홈 브랜드 에딧 — 네이버 쇼핑 API 상품 이미지로 그리드 구성.
 */
export function EditorialTeaserSection() {
  const { items, loading, error } = useNaverProducts(THEME_QUERIES, {
    take: 3,
    display: 40,
  });

  const hero = items[0];
  const thumbs = items.slice(1);
  const section = THEME_SECTION;

  return (
    <section className="border-t border-outline-variant/30 bg-surface-bright/30 px-5 py-16 lg:px-10 lg:py-24">
      <div className="flex items-center justify-between gap-4 border-b border-on-surface/10 pb-4">
        <span className="text-[11px] font-medium tracking-[0.26em] text-on-surface">
          {section?.eyebrow ?? "THIS WEEK'S EDIT"}
        </span>
        <Link
          href="/brands"
          className="text-[11px] tracking-[0.22em] text-on-surface-variant uppercase underline-link"
        >
          Brands →
        </Link>
      </div>

      <h2 className="mt-6 font-playfair text-[24px] leading-tight text-on-surface sm:text-[28px]">
        {section?.title ?? "The cashmere edit"}
      </h2>
      <p className="mt-2 max-w-lg text-[13px] text-on-surface-variant">
        {section?.subtitle ?? "Last cashmere coats before winter fades"}
      </p>

      {loading ? (
        <div className="mt-8 grid grid-cols-12 gap-4 lg:mt-10 lg:gap-6">
          <div className="silhouette-bg col-span-12 aspect-[4/5] animate-pulse sm:col-span-7" />
          <div className="col-span-12 flex flex-col gap-4 sm:col-span-5">
            <div className="silhouette-bg aspect-[4/5] animate-pulse" />
            <div className="silhouette-bg aspect-[4/5] animate-pulse" />
          </div>
        </div>
      ) : items.length === 0 ? (
        <p className="mt-8 text-[13px] text-on-surface-variant">
          {error
            ? "Could not load products from Naver Shopping. Check API keys in .env.local."
            : "No products matched this edit yet."}
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
