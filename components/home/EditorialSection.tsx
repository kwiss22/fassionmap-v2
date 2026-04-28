"use client";

import Link from "next/link";
import { productDedupeKey, type Product } from "@/lib/product";
import { ProductCard } from "@/components/ProductCard";
import { AIChip } from "@/components/ui/AIChip";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow: string;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  viewAllHref?: string;
  items: Product[];
  loading?: boolean;
  /** AI 라벨 노출 여부(aieybrow 필과 나란히) */
  isAi?: boolean;
};

export function EditorialSection({
  eyebrow,
  title,
  titleHighlight,
  subtitle,
  viewAllHref,
  items,
  loading,
  isAi,
}: Props) {
  return (
    <section className="px-5 py-8">
      <header className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            {isAi && <AIChip>AI</AIChip>}
            <p className="eyebrow-bold">{eyebrow}</p>
          </div>
          <h2 className="editorial-display mt-2 text-[28px] leading-[0.98]">
            {renderHighlight(title, titleHighlight)}
          </h2>
          {subtitle && (
            <p className="mt-2 text-[12px] text-on-surface-variant">
              {subtitle}
            </p>
          )}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="eyebrow-bold shrink-0 self-end underline-link"
          >
            VIEW ALL →
          </Link>
        )}
      </header>

      {loading && items.length === 0 ? (
        <SectionSkeleton />
      ) : items.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-on-surface-variant">
          이 섹션은 곧 업데이트됩니다.
        </p>
      ) : (
        <div
          className={cn(
            "grid gap-x-3 gap-y-6",
            "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          )}
        >
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

function renderHighlight(title: string, highlight?: string) {
  if (!highlight) return title;
  const idx = title.indexOf(highlight);
  if (idx < 0) return title;
  return (
    <>
      {title.slice(0, idx)}
      <em className="italic">{highlight}</em>
      {title.slice(idx + highlight.length)}
    </>
  );
}

function SectionSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="silhouette-bg aspect-[4/5] w-full animate-pulse" />
          <div className="h-2 w-1/2 animate-pulse bg-surface-container" />
          <div className="h-3 w-4/5 animate-pulse bg-surface-container" />
          <div className="h-3 w-1/3 animate-pulse bg-surface-container" />
        </div>
      ))}
    </div>
  );
}
