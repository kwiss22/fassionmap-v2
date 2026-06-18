"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Product } from "@/lib/product";

type FeedHotspotProps = {
  label: string;
  product: Product;
  x: number;
  y: number;
  onOpen: (product: Product) => void;
};

export function FeedHotspot({
  label,
  product,
  x,
  y,
  onOpen,
}: FeedHotspotProps) {
  const [open, setOpen] = useState(false);

  return (
    <button
      type="button"
      aria-label={`View ${label}`}
      onClick={() => {
        setOpen((v) => !v);
        onOpen(product);
      }}
      className="absolute z-10 -translate-x-1/2 -translate-y-1/2 border-0 bg-transparent p-0"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <span
        className="hs-pulse-ring pointer-events-none absolute inset-[-7px] rounded-full border border-[rgba(184,255,46,0.5)]"
        aria-hidden
      />
      <span
        className="block h-2.5 w-2.5 rounded-full bg-[var(--color-lime)] shadow-[0_0_0_2.5px_rgba(255,255,255,0.6)]"
        aria-hidden
      />
      <AnimatePresence>
        {open && (
          <motion.span
            key="tip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.14 }}
            className="pointer-events-none absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2.5 py-1.5 font-body text-[10px] font-medium text-white"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
