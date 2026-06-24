"use client";

import Image from "next/image";
import Link from "next/link";
import type { StylingLook } from "@/lib/styling-looks";
import type { Product } from "@/lib/product";
import { productToDetailHref } from "@/lib/product";
import {
  HOTSPOT_POS,
  LOOK_TAGS,
  feedEdition,
} from "@/lib/feed-look-meta";
import { FeedHotspot } from "@/components/feed/FeedHotspot";
import { FeedStripCard } from "@/components/feed/FeedStripCard";
import { SparklesIcon } from "@/components/ui/SparklesIcon";

type FeedLookArticleProps = {
  look: StylingLook;
  index: number;
  saved: boolean;
  onToggleSave: () => void;
  onProductSelect: (product: Product) => void;
  showDivider?: boolean;
};

export function FeedLookArticle({
  look,
  index,
  saved,
  onToggleSave,
  onProductSelect,
  showDivider = true,
}: FeedLookArticleProps) {
  const products = look.pieces
    .map((p) => p.product)
    .filter((p): p is Product => p != null);
  const outerPiece = look.pieces.find((p) => p.role === "outer")?.product;
  const heroProduct =
    (outerPiece?.imageUrl ? outerPiece : null) ??
    products.find((p) => p.imageUrl) ??
    products[0] ??
    null;
  const tags = LOOK_TAGS[look.id] ?? [];
  const edition = feedEdition(index);
  const firstDetail = products[0];

  return (
    <article className="pb-6">
      <div className="flex items-center justify-between px-5 pb-2.5 pt-3.5">
        <span className="font-mono text-[8px] uppercase tracking-[0.14em] text-on-surface-variant">
          {edition}
        </span>
        <button
          type="button"
          aria-label={saved ? "Remove look from saved" : "Save look"}
          aria-pressed={saved}
          onClick={onToggleSave}
          className="border-0 bg-transparent p-0"
        >
          <BookmarkIcon filled={saved} />
        </button>
      </div>

      <div className="relative mx-5 overflow-hidden rounded-[14px]">
        <div className="relative h-[360px] bg-surface-container">
          {heroProduct?.imageUrl ? (
            <Image
              src={heroProduct.imageUrl}
              alt={look.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 640px"
              priority={index === 0}
            />
          ) : (
            <div className="silhouette-bg absolute inset-0" aria-hidden />
          )}
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[150px] bg-gradient-to-t from-black/60 to-transparent"
          aria-hidden
        />
        <div className="absolute bottom-4 left-4">
          {(look.subtitle ?? look.context) && (
            <p className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.14em] text-white/50">
              {look.subtitle ?? look.context}
            </p>
          )}
          <h2 className="font-playfair text-2xl font-normal leading-none text-white">
            {look.title}
          </h2>
        </div>

        {look.pieces.map((piece) => {
          if (!piece.product) return null;
          const pos = HOTSPOT_POS[piece.role];
          return (
            <FeedHotspot
              key={piece.role}
              label={piece.label}
              product={piece.product}
              x={pos.x}
              y={pos.y}
              onOpen={onProductSelect}
            />
          );
        })}
      </div>

      <div className="px-5 pt-3">
        <div className="mb-2 flex items-start gap-1.5">
          <div className="mt-px flex h-[17px] w-[17px] shrink-0 items-center justify-center rounded-[5px] bg-[var(--color-lime)]">
            <SparklesIcon className="h-2.5 w-2.5 text-ink" />
          </div>
          <p className="font-body text-xs font-light italic leading-relaxed text-on-surface-variant">
            {look.reason}
          </p>
        </div>

        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-outline-variant/80 bg-surface-container px-2 py-0.5 font-mono text-[8px] tracking-[0.08em] text-on-surface-variant"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mb-2.5 flex items-center justify-between">
          <span className="font-playfair text-base text-on-surface">
            Shop This Look
          </span>
          {firstDetail && (
            <Link
              href={productToDetailHref(firstDetail)}
              className="inline-flex items-center gap-0.5 border-0 bg-transparent font-body text-[10px] text-on-surface-variant"
            >
              View all
              <ChevronRightIcon />
            </Link>
          )}
        </div>
      </div>

      {products.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {products.map((product, pi) => (
            <FeedStripCard
              key={product.id}
              product={product}
              aiPick={pi === 0}
              onSelect={onProductSelect}
            />
          ))}
        </div>
      ) : (
        <p className="px-5 font-body text-xs text-on-surface-variant">
          Loading pieces…
        </p>
      )}

      {showDivider && (
        <div className="mx-5 mt-5 h-px bg-outline-variant/60" aria-hidden />
      )}
    </article>
  );
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3.5h12v17l-6-4-6 4v-17Z"
        stroke={filled ? "#111111" : "#c0c0c0"}
        fill={filled ? "#111111" : "none"}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
