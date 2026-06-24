"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { Product } from "@/lib/product";
import { productToWebviewHref } from "@/lib/product";
import { formatProductPrice } from "@/lib/price";
import { SparklesIcon } from "@/components/ui/SparklesIcon";

const ORDER_ROWS = [
  { label: "Oversized Linen Shirt (Oversized L)", value: "$16.80", lime: false },
  { label: "FMAP5 Cashback (5%)", value: "−$0.84", lime: true },
  { label: "Free Shipping", value: "$0.00", lime: false },
] as const;

type CheckoutSuccessScreenProps = {
  product: Product;
};

export function CheckoutSuccessScreen({ product }: CheckoutSuccessScreenProps) {
  const priceLabel = formatProductPrice(product);
  const webviewHref = productToWebviewHref(product);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#0a0a0a] text-[#e8e8e8]">
      <div className="flex flex-1 flex-col items-center overflow-y-auto px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="relative mb-6 mt-8 flex items-center justify-center">
          <div
            className="absolute h-[130px] w-[130px] rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(184,255,46,0.12) 0%, transparent 70%)",
            }}
            aria-hidden
          />
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.06, 1] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute h-24 w-24 rounded-full border border-[rgba(184,255,46,0.25)]"
          />
          <motion.div
            animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.04, 1] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
            className="absolute h-[78px] w-[78px] rounded-full border border-[rgba(184,255,46,0.4)]"
          />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 22, delay: 0.1 }}
            className="flex h-[68px] w-[68px] items-center justify-center rounded-full bg-[var(--color-lime)] shadow-[0_0_0_8px_rgba(184,255,46,0.12),0_0_32px_rgba(184,255,46,0.4)]"
          >
            <CheckIcon />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.18 }}
          className="mb-6 w-full text-center"
        >
          <h1 className="mb-2.5 font-rajdhani text-[28px] font-bold uppercase leading-tight tracking-[0.08em] text-white">
            Back in Fassionmap
          </h1>
          <p className="mx-auto max-w-[280px] font-body text-[13px] font-light leading-relaxed text-[#555555]">
            Your cashback has been recorded. We&apos;ll notify you when the order
            ships.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="mb-4 w-full overflow-hidden rounded-2xl border border-[#1e1e1e] bg-[#111111]"
        >
          <div className="flex items-center justify-between border-b border-[#1a1a1a] px-[18px] py-3">
            <span className="font-mono text-[9px] font-medium uppercase tracking-[0.16em] text-[#555555]">
              Order Summary
            </span>
            <div className="flex items-center gap-1">
              <span className="h-[5px] w-[5px] rounded-full bg-[var(--color-lime)] shadow-[0_0_6px_var(--color-lime)]" />
              <span className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#3a5028]">
                Confirmed
              </span>
            </div>
          </div>
          <div className="px-[18px] py-2.5">
            {ORDER_ROWS.map((row, i) => (
              <div
                key={row.label}
                className={
                  i < ORDER_ROWS.length - 1
                    ? "flex items-center justify-between border-b border-[#181818] py-1.5"
                    : "flex items-center justify-between py-1.5"
                }
              >
                <span
                  className={
                    row.lime
                      ? "flex-1 pr-3 font-body text-[11.5px] font-light text-[#6a9a38]"
                      : "flex-1 pr-3 font-body text-[11.5px] font-light text-[#585858]"
                  }
                >
                  {row.label}
                </span>
                <span
                  className={
                    row.lime
                      ? "shrink-0 font-mono text-xs font-bold text-[var(--color-lime)]"
                      : "shrink-0 font-mono text-xs text-[#888888]"
                  }
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
          <div className="mx-[18px] h-px bg-[#222222]" />
          <div className="flex items-center justify-between px-[18px] py-3.5">
            <span className="font-body text-sm font-semibold text-[#e8e8e8]">
              Total
            </span>
            <span className="font-mono text-[22px] font-bold tracking-tight text-white">
              {priceLabel || "$15.96"}
            </span>
          </div>
          <div className="mx-3 mb-3 flex items-center gap-1.5 rounded-lg border border-[rgba(184,255,46,0.12)] bg-[rgba(184,255,46,0.06)] px-3 py-2">
            <SparklesIcon className="h-[11px] w-[11px] shrink-0 text-[var(--color-lime)]" />
            <p className="font-body text-[11px] font-light leading-snug text-[#6a9a38]">
              You saved{" "}
              <span className="font-mono font-bold text-[var(--color-lime)]">
                $0.84
              </span>{" "}
              via Fassionmap AI affiliate — 5% more than buying direct.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
        >
          <Link
            href={webviewHref}
            className="mb-6 inline-flex items-center gap-1.5 rounded-lg border border-[#222222] px-[18px] py-2"
          >
            <ExternalLinkIcon />
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#444444]">
              Reopen Webview
            </span>
          </Link>
        </motion.div>

        <div className="h-24" aria-hidden />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0a0a0a] from-60% to-transparent px-6 pb-9 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, type: "spring", stiffness: 280, damping: 28 }}
        >
          <Link
            href="/feed"
            className="flex w-full items-center justify-center gap-2 rounded-[14px] border-0 bg-white py-4 font-body text-[15px] font-semibold text-[#0a0a0a] transition-opacity hover:opacity-90"
          >
            Go Back to Feed
            <ChevronIcon />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12l5 5L20 7"
        stroke="#0a0a0a"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M14 5h5v5M10 14 19 5M15 5H5v14h14v-5"
        stroke="#444444"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="#0a0a0a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
