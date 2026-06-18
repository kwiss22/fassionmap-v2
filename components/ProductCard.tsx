"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product, productToDetailHref } from "@/lib/product";
import { formatAmount, productDisplayCurrency } from "@/lib/price";
import { cn } from "@/lib/utils";
import { HeartToggle } from "@/components/ui/HeartToggle";
import { MallBadge, formatMallDisplay } from "@/components/product/MallBadge";
import { extractBrand } from "@/lib/brand-extract";
import { isBoostedMall } from "@/lib/mall-policy";
import { SparklesIcon } from "@/components/ui/SparklesIcon";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  discountPct?: number;
  originalPrice?: number;
  brandOverride?: string;
  /** v2.1 feed — lime AI Pick badge */
  aiPick?: boolean;
  className?: string;
};

export function ProductCard({
  product,
  priority = false,
  discountPct,
  originalPrice,
  brandOverride,
  aiPick = false,
  className,
}: ProductCardProps) {
  const detailHref = productToDetailHref(product);

  const detectedBrand = extractBrand(product.name);
  const boostedMallLabel = isBoostedMall(product.mallName)
    ? formatMallDisplay(product.mallName ?? "")
    : "";
  const eyebrow = brandOverride ?? detectedBrand ?? boostedMallLabel ?? "";

  const showMallBadge =
    !!product.mallName && isBoostedMall(product.mallName);

  const currency = productDisplayCurrency(product);
  const priceLabel = formatAmount(product.price, currency);
  const originalLabel =
    typeof originalPrice === "number" && originalPrice > product.price
      ? formatAmount(originalPrice, currency)
      : null;

  return (
    <article className={cn("group fm-card flex flex-col", className)}>
      <Link
        href={detailHref}
        className="img-hover-zoom silhouette-bg relative block aspect-[4/5] w-full overflow-hidden fm-card-media"
        aria-label={product.name}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
        />

        {aiPick && (
          <div className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-[var(--color-lime)] px-1.5 py-0.5">
            <SparklesIcon className="h-2 w-2 text-ink" />
            <span className="font-mono text-[7px] font-bold uppercase tracking-[0.08em] text-ink">
              AI Pick
            </span>
          </div>
        )}

        {typeof discountPct === "number" && discountPct > 0 && (
          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-on-surface px-2 py-1 font-mono text-[9px] font-semibold tracking-wide text-on-primary-container">
            −{discountPct}%
          </span>
        )}

        <HeartToggle
          product={product}
          size="sm"
          className="absolute right-1.5 top-1.5"
        />

        {showMallBadge && product.mallName && (
          <div className="pointer-events-none absolute bottom-1.5 left-1.5">
            <MallBadge mall={product.mallName} variant="solid" />
          </div>
        )}
      </Link>

      <div className="space-y-1 px-2.5 pb-2.5 pt-2">
        {eyebrow && (
          <p className="truncate font-mono text-[7px] uppercase tracking-[0.12em] text-on-surface-variant">
            {eyebrow}
          </p>
        )}
        <Link
          href={detailHref}
          title={product.name}
          className="clamp-2 block font-body text-[10.5px] leading-snug text-on-surface transition-colors group-hover:text-secondary"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 pt-0.5">
          <span className="font-mono text-xs font-semibold tabular-nums text-on-surface">
            {priceLabel}
          </span>
          {originalLabel && (
            <span className="font-mono text-[10px] tabular-nums text-on-surface-variant line-through">
              {originalLabel}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
