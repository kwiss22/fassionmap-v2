"use client";

import Image from "next/image";
import type { Product } from "@/lib/product";
import { formatProductPrice } from "@/lib/price";
import { extractBrand } from "@/lib/brand-extract";
import { HeartToggle } from "@/components/ui/HeartToggle";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { cn } from "@/lib/utils";

type FeedStripCardProps = {
  product: Product;
  aiPick?: boolean;
  onSelect: (product: Product) => void;
  className?: string;
};

export function FeedStripCard({
  product,
  aiPick = false,
  onSelect,
  className,
}: FeedStripCardProps) {
  const brand =
    extractBrand(product.name) ??
    product.mallName ??
    product.mall ??
    "Brand";

  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={cn(
        "fm-card w-[132px] shrink-0 cursor-pointer text-left",
        className
      )}
    >
      <div className="relative h-[148px] bg-surface-container">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="132px"
        />
        {aiPick && (
          <div className="absolute left-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-[var(--color-lime)] px-1.5 py-0.5">
            <SparklesIcon className="h-2 w-2 text-ink" />
            <span className="font-mono text-[7px] font-bold uppercase tracking-[0.08em] text-ink">
              AI Pick
            </span>
          </div>
        )}
      </div>
      <div className="px-2.5 pb-2.5 pt-2">
        <p className="mb-0.5 font-mono text-[7px] uppercase tracking-[0.12em] text-on-surface-variant">
          {brand}
        </p>
        <p className="mb-1.5 line-clamp-2 font-body text-[10.5px] leading-snug text-on-surface">
          {product.name}
        </p>
        <div className="flex items-center justify-between gap-1">
          <span className="font-mono text-xs font-semibold text-on-surface">
            {formatProductPrice(product)}
          </span>
          <HeartToggle product={product} size="sm" />
        </div>
      </div>
    </button>
  );
}
