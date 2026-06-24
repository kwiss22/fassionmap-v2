"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/product";
import { productToWebviewHref } from "@/lib/product";
import { isAffiliateSupported } from "@/lib/affiliate";
import { extractBrand } from "@/lib/brand-extract";
import { readFitPreference } from "@/lib/onboarding-preferences";
import { formatProductPrice } from "@/lib/price";
import { formatMallDisplay } from "@/components/product/MallBadge";
import { HeartToggle } from "@/components/ui/HeartToggle";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { cn } from "@/lib/utils";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;

type ProductDetailScreenProps = {
  product: Product;
};

export function ProductDetailScreen({ product }: ProductDetailScreenProps) {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState<(typeof SIZES)[number]>("M");
  const fit = readFitPreference();
  const brand =
    extractBrand(product.name) ??
    product.mallName ??
    product.mall ??
    "Brand";
  const webviewHref = productToWebviewHref(product);
  const mallLabel = formatMallDisplay(product.mallName ?? product.mall ?? "Store");
  const priceLabel = formatProductPrice(product);
  const mallInitials = mallLabel.slice(0, 2).toUpperCase();
  const isAffiliate = isAffiliateSupported(product.mallName ?? "");

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-surface text-on-surface">
      <header className="flex shrink-0 items-center justify-between border-b border-outline-variant/60 px-5 pb-2.5 pt-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 border-0 bg-transparent p-0"
        >
          <BackIcon />
          <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-on-surface-variant">
            Back
          </span>
        </button>
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-on-surface-variant">
          Product Detail
        </span>
        <HeartToggle product={product} size="sm" />
      </header>

      <div className="flex-1 overflow-y-auto pb-28 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative h-[280px] bg-surface-container">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        <div className="px-5 pt-3.5">
          <p className="mb-1 font-mono text-[8px] uppercase tracking-[0.14em] text-on-surface-variant">
            {brand}
          </p>
          <div className="mb-2 flex items-start justify-between gap-3">
            <h1 className="flex-1 font-playfair text-xl font-normal leading-snug text-on-surface">
              {product.name}
            </h1>
            <div className="shrink-0 text-right">
              <p className="font-mono text-xl font-bold tracking-tight text-[#E62A2A]">
                {priceLabel}
              </p>
            </div>
          </div>

          <p className="mb-2 font-body text-[11px] font-medium text-on-surface">
            Size
          </p>
          <div className="mb-4 flex gap-1.5">
            {SIZES.map((size) => {
              const active = selectedSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={cn(
                    "flex-1 rounded-md border-[1.5px] py-1.5 font-mono text-[10px] transition-colors",
                    active
                      ? "border-ink bg-ink font-medium text-white"
                      : "border-ink/10 text-on-surface-variant"
                  )}
                >
                  {size}
                </button>
              );
            })}
          </div>

          <div className="relative mb-4 overflow-hidden rounded-[10px] border-[1.5px] border-[rgba(184,255,46,0.2)] bg-[rgba(184,255,46,0.04)] px-3.5 py-3">
            <div
              className="absolute bottom-0 left-0 top-0 w-[3px] bg-gradient-to-b from-[var(--color-lime)] to-[rgba(184,255,46,0.3)]"
              aria-hidden
            />
            <div className="mb-1 flex items-center gap-1.5 pl-1.5">
              <div className="flex h-4 w-4 items-center justify-center rounded bg-[var(--color-lime)]">
                <SparklesIcon className="h-2.5 w-2.5 text-ink" />
              </div>
              <span className="font-body text-[11px] font-semibold text-on-surface">
                Highly Rated for {fit} Fit
              </span>
              <span className="ml-auto font-mono text-sm font-semibold tracking-tight text-on-surface">
                94%
              </span>
            </div>
            <p className="pl-1.5 font-body text-[11px] font-light italic leading-relaxed text-on-surface-variant">
              AI matched this piece to your saved looks and #{fit.toLowerCase()}{" "}
              fit preference.
            </p>
          </div>

          <p className="mb-3 font-body text-xs font-semibold text-on-surface">
            AI Found Best Prices
          </p>

          <AffiliateOfferRow
            logo={mallInitials}
            logoBg="#fff1f1"
            logoColor="#111111"
            name={mallLabel}
            shipping="Ships from partner store"
            shippingColor="#555555"
            price={priceLabel}
            affiliateHref={webviewHref}
            primary
            showBestBadge={isAffiliate}
          />

          {product.source === "aliexpress" && (
            <AffiliateOfferRow
              logo="AE"
              logoBg="#fff1f1"
              logoColor="#E62A2A"
              name="AliExpress"
              shipping="Global shipping"
              shippingColor="#34a853"
              price={priceLabel}
              affiliateHref={webviewHref}
            />
          )}
        </div>
      </div>

      <footer className="absolute inset-x-0 bottom-0 border-t border-outline-variant/60 bg-surface/95 px-5 pb-7 pt-3 backdrop-blur-md">
        <Link
          href={webviewHref}
          className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[13px] border-0 bg-ink py-3.5"
        >
          <span
            className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[rgba(184,255,46,0.12)] to-transparent"
            aria-hidden
          />
          <SparklesIcon className="h-3.5 w-3.5 text-[var(--color-lime)]" />
          <span className="font-body text-sm font-semibold text-white">
            Get AI Affiliate Discount
          </span>
        </Link>
        <Link
          href="/feed"
          className="mt-2 block text-center font-mono text-[8px] uppercase tracking-[0.12em] text-on-surface-variant"
        >
          Continue browsing feed
        </Link>
      </footer>
    </div>
  );
}

function AffiliateOfferRow({
  logo,
  logoBg,
  logoColor,
  name,
  shipping,
  shippingColor,
  price,
  affiliateHref,
  primary = false,
  showBestBadge = false,
}: {
  logo: string;
  logoBg: string;
  logoColor: string;
  name: string;
  shipping: string;
  shippingColor: string;
  price: string;
  affiliateHref: string;
  primary?: boolean;
  showBestBadge?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative mb-2.5 overflow-hidden rounded-[10px] border-[1.5px] px-3.5 py-3",
        primary
          ? "border-ink/15 bg-surface-container"
          : "border-outline-variant/80 bg-[#fdfdfd]"
      )}
    >
      {primary && (
        <div
          className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-[var(--color-lime)] to-transparent"
          aria-hidden
        />
      )}
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-mono text-[11px] font-bold"
          style={{ backgroundColor: logoBg, color: logoColor }}
        >
          {logo}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-0.5 flex items-center gap-1">
            <span className="font-body text-xs font-medium text-on-surface">
              {name}
            </span>
            {showBestBadge && (
              <span className="rounded-sm bg-[var(--color-lime)] px-1 py-px font-mono text-[7px] font-semibold text-ink">
                AI Best
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
        <div className="shrink-0 text-right">
          <p className="font-mono text-[17px] font-bold leading-none tracking-tight text-on-surface">
            {price}
          </p>
          <Link
            href={affiliateHref}
            className={cn(
              "mt-1 inline-flex items-center gap-1 rounded-md border px-2.5 py-1 font-body text-[10px] font-medium",
              primary
                ? "border-ink bg-ink text-white"
                : "border-outline-variant text-on-surface-variant"
            )}
          >
            Buy Now
            <ExternalLinkIcon light={primary} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5l-7 7 7 7"
        stroke="#111111"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalLinkIcon({ light }: { light?: boolean }) {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 5h5v5M10 14 19 5M15 5H5v14h14v-5"
        stroke={light ? "#ffffff" : "#555555"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
