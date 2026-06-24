"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/lib/product";
import { productToSuccessHref } from "@/lib/product";
import { readFitPreference } from "@/lib/onboarding-preferences";
import { formatProductPrice } from "@/lib/price";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { cn } from "@/lib/utils";

const THUMB_FALLBACK =
  "https://images.unsplash.com/photo-1713881587420-113c1c43e28a?w=500&h=580&fit=crop&auto=format";

type AffiliateWebviewScreenProps = {
  product: Product;
  returnHref?: string;
};

export function AffiliateWebviewScreen({
  product,
  returnHref = "/feed",
}: AffiliateWebviewScreenProps) {
  const router = useRouter();
  const fit = readFitPreference();
  const lockedSize = `${fit} L`;
  const priceLabel = formatProductPrice(product);
  const [activeThumb, setActiveThumb] = useState(0);
  const [ordered, setOrdered] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const thumbs = [product.imageUrl, THUMB_FALLBACK, product.imageUrl, THUMB_FALLBACK];

  const handleBuy = () => {
    setOrdered(true);
    window.setTimeout(() => {
      router.push(productToSuccessHref(product));
    }, 800);
  };

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden bg-surface">
      <div className="relative z-[60] shrink-0">
        <div
          className="h-0.5 bg-gradient-to-r from-transparent via-[var(--color-lime)] to-transparent shadow-[0_0_12px_rgba(184,255,46,0.5)]"
          aria-hidden
        />
        <div className="flex min-h-12 items-center gap-1.5 border-b border-[#1c1c1c] bg-[#0a0a0a] px-3.5">
          <Link
            href={returnHref}
            className="flex shrink-0 items-center gap-1 py-1.5"
          >
            <BackIcon />
            <span className="font-rajdhani text-xs font-semibold uppercase tracking-wide text-[var(--color-lime)]">
              Fassionmap
            </span>
          </Link>
          <div className="h-6 w-px shrink-0 bg-[#222222]" aria-hidden />
          <div className="flex flex-1 items-center justify-center overflow-hidden px-0.5 py-1">
            <div className="relative inline-flex max-w-full items-start gap-1 rounded-[9px] border border-[rgba(184,255,46,0.25)] bg-[rgba(184,255,46,0.08)] px-2.5 pb-1.5 pt-1">
              <div className="absolute -top-[5px] left-4 h-0 w-0 border-x-[5px] border-b-[5px] border-x-transparent border-b-[rgba(184,255,46,0.25)]" />
              <div className="absolute -top-[3.5px] left-[17px] h-0 w-0 border-x-4 border-b-4 border-x-transparent border-b-[#0e130a]" />
              <div className="mt-px flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded bg-[var(--color-lime)]">
                <SparklesIcon className="h-2 w-2 text-[#0a0a0a]" />
              </div>
              <div className="min-w-0">
                <p className="mb-px whitespace-nowrap font-mono text-[7px] font-semibold uppercase tracking-[0.14em] text-[var(--color-lime)]">
                  AI Assistant
                </p>
                <p className="font-body text-[10px] leading-snug text-[#d0d0d0]">
                  Size{" "}
                  <span className="font-mono text-[9.5px] font-bold text-[var(--color-lime)]">
                    {lockedSize}
                  </span>{" "}
                  locked · Max discount.
                </p>
              </div>
            </div>
          </div>
          <div className="h-6 w-px shrink-0 bg-[#222222]" aria-hidden />
          <Link
            href={returnHref}
            aria-label="Close webview"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-[#222222]"
          >
            <CloseIcon />
          </Link>
        </div>
        <div className="flex items-center gap-1.5 border-b border-[rgba(184,255,46,0.1)] bg-[#0c0f09] px-3.5 py-1">
          <CheckCircleIcon />
          <p className="flex-1 font-mono text-[8px] tracking-[0.08em] text-[#4a6a2a]">
            AFFILIATE CASHBACK{" "}
            <span className="font-bold text-[var(--color-lime)]">+5% FMAP5</span>{" "}
            ACTIVATED · Saving{" "}
            <span className="text-[var(--color-lime)]">$0.84</span>
          </p>
          <ZapIcon />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 border-b border-[#e0e0e0] bg-[#f0f0f0] px-3 py-1.5">
        <ShieldIcon />
        <div className="flex flex-1 items-center gap-1 overflow-hidden rounded-md bg-[#e4e4e4] px-2.5 py-1">
          <LockIcon />
          <span className="flex-1 truncate font-mono text-[9px] text-[#555555]">
            aliexpress.com/item/1005006784321098.html
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setSpinning(true);
            window.setTimeout(() => setSpinning(false), 700);
          }}
          className="border-0 bg-transparent p-0.5"
          aria-label="Refresh"
        >
          <RefreshIcon spinning={spinning} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto bg-white [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex items-center gap-2 bg-[#e02020] px-3.5 py-1.5">
          <span className="font-serif text-sm font-bold italic text-white">
            AliExpress
          </span>
          <div className="flex-1 rounded bg-white/20 px-2.5 py-1">
            <span className="font-body text-[10px] text-white/60">
              Search in AliExpress…
            </span>
          </div>
          <CartIcon />
        </div>

        <div className="relative bg-[#f8f8f8]">
          <div className="relative h-60 overflow-hidden">
            <Image
              src={thumbs[activeThumb] ?? product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              sizes="430px"
            />
          </div>
          <div className="absolute left-2.5 top-2.5 flex items-center gap-1 rounded-md border border-[rgba(184,255,46,0.3)] bg-[rgba(10,10,10,0.82)] px-2 py-1 backdrop-blur-md">
            <SparklesIcon className="h-2 w-2 text-[var(--color-lime)]" />
            <span className="font-mono text-[7px] font-semibold uppercase tracking-[0.12em] text-[var(--color-lime)]">
              AI Verified
            </span>
          </div>
          <div className="flex gap-1.5 bg-[#f8f8f8] px-3.5 py-1.5">
            {thumbs.map((src, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveThumb(i)}
                className={cn(
                  "relative h-[42px] w-[38px] shrink-0 overflow-hidden rounded-[5px] border-2 bg-[#ebebeb] p-0",
                  i === activeThumb
                    ? "border-[var(--color-lime)] shadow-[0_0_8px_rgba(184,255,46,0.4)]"
                    : "border-transparent"
                )}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="38px" />
              </button>
            ))}
          </div>
        </div>

        <div className="border-b border-[#f4f4f4] bg-[#fffef9] px-3.5 py-2.5">
          <div className="mb-1.5 flex items-end gap-2">
            <span className="font-mono text-[26px] font-bold leading-none tracking-tighter text-[#e02020]">
              {priceLabel}
            </span>
            <span className="mb-0.5 font-body text-[13px] text-[#cccccc] line-through">
              $198.00
            </span>
            <span className="mb-0.5 rounded-sm bg-[#e02020] px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
              91% OFF
            </span>
          </div>
          <div className="inline-flex items-center gap-1 rounded-[5px] border border-[rgba(184,255,46,0.28)] bg-[rgba(184,255,46,0.1)] px-2.5 py-1">
            <CheckCircleIcon lime />
            <span className="font-body text-[10px] font-medium text-[#5a8a1a]">
              Fassionmap cashback:{" "}
              <span className="font-mono font-bold text-[var(--color-lime)]">
                +5% = −$0.84
              </span>
            </span>
            <LockIcon lime />
          </div>
        </div>

        <div className="border-b border-[#f4f4f4] px-3.5 py-2.5">
          <p className="mb-1.5 font-body text-xs leading-snug text-[#111111]">
            {product.name}
          </p>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
              <StarIcon key={s} filled={s <= 4} />
            ))}
            <span className="ml-0.5 font-body text-[11px] text-[#888888]">
              4.8 · 12.4k sold
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 border-b border-[#f4f4f4] px-3.5 py-2">
          <TruckIcon />
          <span className="font-body text-[11px] text-[#111111]">
            <span className="font-semibold text-[#34a853]">Free Shipping</span> ·
            Est. Jun 28–Jul 6
          </span>
        </div>

        <div className="border-b border-[#f4f4f4] px-3.5 py-2.5 pb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-body text-xs font-semibold text-[#111111]">
              Size
            </span>
            <div className="inline-flex items-center gap-1 rounded-[5px] border border-[rgba(184,255,46,0.28)] bg-[rgba(184,255,46,0.1)] px-2 py-0.5">
              <LockIcon lime />
              <span className="font-mono text-[8px] font-bold uppercase tracking-[0.06em] text-[var(--color-lime)]">
                AI Locked · {lockedSize}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            {["XS", "S", "M", "L", "XL", "XXL"].map((sz) => {
              const locked = sz === "L";
              return (
                <div
                  key={sz}
                  className={cn(
                    "relative flex h-[38px] w-10 items-center justify-center rounded-md",
                    locked
                      ? "border-2 border-[var(--color-lime)] bg-[rgba(184,255,46,0.08)] shadow-[0_0_10px_rgba(184,255,46,0.2)]"
                      : "border border-[#e0e0e0] bg-[#fafafa]"
                  )}
                >
                  {locked && (
                    <LockIcon
                      lime
                      className="absolute right-0.5 top-0.5 h-2 w-2"
                    />
                  )}
                  <span
                    className={cn(
                      "font-mono text-[10px]",
                      locked
                        ? "font-bold text-[var(--color-lime)]"
                        : "text-[#999999]"
                    )}
                  >
                    {sz}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 px-3.5 py-3">
          <button
            type="button"
            className="flex-1 rounded-[7px] border-[1.5px] border-[#ff9900] bg-[#fff8ee] py-2.5 font-body text-xs font-semibold text-[#c07000]"
          >
            Add to Cart
          </button>
          <button
            type="button"
            onClick={handleBuy}
            disabled={ordered}
            className="flex flex-[1.5] items-center justify-center gap-1 rounded-[7px] border-0 bg-[#e02020] py-2.5 font-body text-xs font-semibold text-white disabled:opacity-80"
          >
            {ordered ? (
              <>
                <CheckCircleIcon light />
                Processing…
              </>
            ) : (
              "Buy Now"
            )}
          </button>
        </div>

        <div className="flex items-center justify-center gap-1 px-3.5 pb-6">
          <PackageIcon />
          <span className="font-body text-[10px] text-[#aaaaaa]">
            Buyer Protection · Full refund guaranteed
          </span>
        </div>
      </div>
    </div>
  );
}

function BackIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5l-7 7 7 7"
        stroke="#b8ff2e"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="#666666"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CheckCircleIcon({
  lime,
  light,
}: {
  lime?: boolean;
  light?: boolean;
}) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke={light ? "#ffffff" : lime ? "#b8ff2e" : "#b8ff2e"}
        strokeWidth="2"
      />
      <path
        d="M8 12l3 3 5-6"
        stroke={light ? "#ffffff" : lime ? "#b8ff2e" : "#b8ff2e"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"
        stroke="#b8ff2e"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z"
        stroke="#34a853"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({
  lime,
  className,
}: {
  lime?: boolean;
  className?: string;
}) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke={lime ? "#b8ff2e" : "#888888"}
        strokeWidth="2"
      />
      <path
        d="M8 11V8a4 4 0 0 1 8 0v3"
        stroke={lime ? "#b8ff2e" : "#888888"}
        strokeWidth="2"
      />
    </svg>
  );
}

function RefreshIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={spinning ? "animate-spin" : undefined}
    >
      <path
        d="M4 4v5h5M20 20v-5h-5M20 9A8 8 0 0 0 6 7M4 15a8 8 0 0 0 14 2"
        stroke="#888888"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6h15l-1.5 9h-12L6 6Z"
        stroke="#ffffff"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="20" r="1.5" fill="#ffffff" />
      <circle cx="18" cy="20" r="1.5" fill="#ffffff" />
    </svg>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z"
        fill={filled ? "#ff9900" : "#e8e8e8"}
      />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M1 6h13v9H1V6ZM14 10h4l3 3v2h-7v-5Z"
        stroke="#aaaaaa"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <circle cx="6" cy="18" r="2" stroke="#aaaaaa" strokeWidth="1.8" />
      <circle cx="18" cy="18" r="2" stroke="#aaaaaa" strokeWidth="1.8" />
    </svg>
  );
}

function PackageIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 2 2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="#aaaaaa"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
