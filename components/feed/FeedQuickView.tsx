"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/product";
import { productToDetailHref, productToWebviewHref } from "@/lib/product";
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
  const webviewHref = product ? productToWebviewHref(product) : "#";
  const brand =
    product &&
    (extractBrand(product.name) ??
      product.mallName ??
      product.mall ??
      "Brand");
  const mallLabel = product?.mallName
    ? formatMallDisplay(product.mallName)
    : product?.mall ?? "Store";
  const isAli = product?.source === "aliexpress";

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
            className="fixed inset-x-0 bottom-[var(--app-nav-height)] z-[60] max-h-[min(85dvh,calc(100dvh-var(--app-nav-height)-1rem))] overflow-hidden rounded-t-[20px] bg-surface shadow-[0_-8px_40px_rgba(0,0,0,0.14)]"
          >
            <div
              className="h-[2.5px] bg-gradient-to-r from-transparent via-[var(--color-lime)] to-transparent"
              aria-hidden
            />
            <div className="px-5 pb-7">
              <div className="relative flex items-center justify-center py-3">
                <div
                  className="h-1 w-9 rounded-full bg-[#d4d4d4]"
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-0 top-2.5 flex h-7 w-7 items-center justify-center rounded-full border-0 bg-[#f5f5f5]"
                >
                  <CloseIcon />
                </button>
              </div>

              <div className="mb-3 inline-flex items-center gap-1 rounded-full border border-[rgba(184,255,46,0.3)] bg-[rgba(184,255,46,0.1)] px-2.5 py-1">
                <SparklesIcon className="h-2.5 w-2.5 text-[#7ab000]" />
                <span className="font-mono text-[8px] font-semibold uppercase tracking-[0.12em] text-[#7ab000]">
                  AI Affiliate Pick · 94% Match
                </span>
              </div>

              <div className="mb-3.5 flex items-center gap-3 rounded-xl border border-[#f0f0f0] bg-[#f9f9f9] px-3.5 py-3">
                <div className="relative h-[62px] w-[52px] shrink-0 overflow-hidden rounded-lg bg-[#ececec]">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="52px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-[#aaaaaa]">
                    {brand}
                  </p>
                  <p className="mb-1 line-clamp-2 font-body text-[13px] font-medium leading-snug text-on-surface">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarIcon key={s} filled={s <= 4} />
                    ))}
                    <span className="ml-0.5 font-mono text-[9px] text-[#888888]">
                      4.8
                    </span>
                  </div>
                </div>
                <span className="shrink-0 font-mono text-[17px] font-bold tracking-tight text-on-surface">
                  {formatProductPrice(product)}
                </span>
              </div>

              <p className="mb-2.5 font-body text-xs font-semibold text-on-surface">
                Best Prices
              </p>

              <AffiliateRow
                logo={isAli ? "AE" : mallLabel.slice(0, 2).toUpperCase()}
                logoBg={isAli ? "#fff1f1" : "#f0fff7"}
                logoColor={isAli ? "#E62A2A" : "#03C75A"}
                name={isAli ? "AliExpress" : mallLabel}
                shipping={isAli ? "Free Shipping" : "Lowest Price Match"}
                shippingColor={isAli ? "#34a853" : "#03C75A"}
                price={formatProductPrice(product)}
                best
              />
              <AffiliateRow
                logo={isAli ? "N" : "AE"}
                logoBg={isAli ? "#f0fff7" : "#fff1f1"}
                logoColor={isAli ? "#03C75A" : "#E62A2A"}
                name={isAli ? "Naver Shopping" : "AliExpress"}
                shipping={isAli ? "Lowest Price Match" : "Free Shipping"}
                shippingColor={isAli ? "#03C75A" : "#34a853"}
                price={formatProductPrice(product)}
              />

              <div className="mt-3.5 flex gap-2">
                <Link
                  href={detailHref}
                  onClick={onClose}
                  className="flex flex-1 items-center justify-center gap-1 rounded-[10px] border-[1.5px] border-[#e0e0e0] py-2.5 font-body text-xs font-medium text-[#555555]"
                >
                  Full Details
                  <ChevronRightIcon />
                </Link>
                <Link
                  href={webviewHref}
                  onClick={onClose}
                  className="relative flex flex-1 items-center justify-center gap-1.5 overflow-hidden rounded-[10px] border-0 bg-ink py-2.5 font-body text-xs font-semibold text-white"
                >
                  <span
                    className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[rgba(184,255,46,0.15)] to-transparent"
                    aria-hidden
                  />
                  <SparklesIcon className="h-[11px] w-[11px] text-[var(--color-lime)]" />
                  AI Discount
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function AffiliateRow({
  logo,
  logoBg,
  logoColor,
  name,
  shipping,
  shippingColor,
  price,
  best = false,
}: {
  logo: string;
  logoBg: string;
  logoColor: string;
  name: string;
  shipping: string;
  shippingColor: string;
  price: string;
  best?: boolean;
}) {
  return (
    <div className="flex items-center gap-2.5 border-b border-[#f2f2f2] py-2.5">
      <div
        className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold"
        style={{ backgroundColor: logoBg, color: logoColor }}
      >
        {logo}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-px flex items-center gap-1">
          <span className="font-body text-[11px] font-medium text-on-surface">
            {name}
          </span>
          {best && (
            <span className="rounded-sm bg-[var(--color-lime)] px-1 py-px font-mono text-[7px] font-semibold text-ink">
              Best
            </span>
          )}
        </div>
        <span
          className="font-body text-[10px] font-medium"
          style={{ color: shippingColor }}
        >
          {shipping}
        </span>
      </div>
      <span className="font-mono text-[15px] font-bold tracking-tight text-on-surface">
        {price}
      </span>
    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z"
        fill={filled ? "#111111" : "#e0e0e0"}
      />
    </svg>
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
