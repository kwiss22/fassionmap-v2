"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/product";
import { productToDetailHref } from "@/lib/product";
import { getAffiliateLink, isAffiliateSupported } from "@/lib/affiliate";
import { formatProductPrice } from "@/lib/price";
import { extractBrand } from "@/lib/brand-extract";
import { formatMallDisplay } from "@/components/product/MallBadge";
import { SparklesIcon } from "@/components/ui/SparklesIcon";

type FeedQuickViewProps = {
  product: Product | null;
  onClose: () => void;
};

export function FeedQuickView({ product, onClose }: FeedQuickViewProps) {
  const detailHref = product ? productToDetailHref(product) : "#";
  const brand =
    product &&
    (extractBrand(product.name) ??
      product.mallName ??
      product.mall ??
      "Brand");
  const affiliateHref =
    product &&
    getAffiliateLink(product.link, product.mallName ?? product.mall ?? "");
  const mallLabel = product?.mallName
    ? formatMallDisplay(product.mallName)
    : product?.mall ?? "Store";

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.button
            type="button"
            key="scrim"
            aria-label="Close quick view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[55] bg-black/30"
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-label={product.name}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-[60] overflow-hidden rounded-t-[20px] bg-surface shadow-[0_-8px_40px_rgba(0,0,0,0.14)]"
          >
            <div
              className="h-[2.5px] bg-gradient-to-r from-transparent via-[var(--color-lime)] to-transparent"
              aria-hidden
            />
            <div className="px-5 pb-7">
              <div className="relative flex items-center justify-center py-3">
                <div
                  className="h-1 w-9 rounded-full bg-outline-variant"
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-0 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border-0 bg-surface-container"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[rgba(184,255,46,0.3)] bg-[rgba(184,255,46,0.1)] px-2.5 py-1">
                <SparklesIcon className="h-2.5 w-2.5 text-[#7ab000]" />
                <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-[#7ab000]">
                  AI Affiliate Pick
                </span>
              </div>

              <div className="mb-3.5 flex items-center gap-3 rounded-xl border border-outline-variant/80 bg-surface-container px-3.5 py-3">
                <div className="relative h-[62px] w-[52px] shrink-0 overflow-hidden rounded-lg bg-outline-variant/40">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="52px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-on-surface-variant">
                    {brand}
                  </p>
                  <p className="mb-1 line-clamp-2 font-body text-[13px] font-medium leading-snug text-on-surface">
                    {product.name}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-[17px] font-bold tracking-tight text-on-surface">
                  {formatProductPrice(product)}
                </span>
              </div>

              <p className="mb-2.5 font-body text-xs font-semibold text-on-surface">
                Best Prices
              </p>
              <div className="flex items-center gap-2.5 border-b border-outline-variant/60 py-2.5">
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-ink font-mono text-[11px] font-bold text-white">
                  {mallLabel.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-1">
                    <span className="font-body text-[11px] font-medium text-on-surface">
                      {mallLabel}
                    </span>
                    {isAffiliateSupported(product.mallName ?? "") && (
                      <span className="rounded-sm bg-[var(--color-lime)] px-1 py-px font-mono text-[7px] font-semibold text-ink">
                        Best
                      </span>
                    )}
                  </div>
                  <span className="font-body text-[10px] font-medium text-on-surface-variant">
                    Ships from partner store
                  </span>
                </div>
                <span className="font-mono text-[15px] font-bold tracking-tight text-on-surface">
                  {formatProductPrice(product)}
                </span>
              </div>

              <div className="mt-3.5 flex gap-2">
                <Link
                  href={detailHref}
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center gap-1 rounded-[10px] border-[1.5px] border-outline-variant py-2.5 font-body text-xs font-medium text-on-surface-variant"
                >
                  Full Details
                  <ChevronRightIcon />
                </Link>
                <a
                  href={affiliateHref ?? product.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="relative flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-[10px] border-0 bg-ink py-2.5 font-body text-xs font-semibold text-white"
                >
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[rgba(184,255,46,0.15)] to-transparent"
                    aria-hidden
                  />
                  <SparklesIcon className="h-[11px] w-[11px] text-[var(--color-lime)]" />
                  Shop Now
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function CloseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="#888888"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
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
