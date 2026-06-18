"use client";

import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/lib/utils";

type OnboardingVibeChipProps = {
  label: string;
  active: boolean;
  onToggle: () => void;
};

export function OnboardingVibeChip({
  label,
  active,
  onToggle,
}: OnboardingVibeChipProps) {
  return (
    <motion.button
      type="button"
      layout
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      onClick={onToggle}
      className={cn(
        "inline-flex cursor-pointer items-center rounded-full border bg-transparent",
        active
          ? "gap-1.5 border-[1.5px] border-ink bg-ink px-3.5 py-1.5 pl-3.5"
          : "gap-0 border border-outline-variant px-3.5 py-1.5"
      )}
    >
      <span
        className={cn(
          "whitespace-nowrap font-mono text-[11px] tracking-wide transition-colors",
          active ? "font-medium text-white" : "text-on-surface-variant"
        )}
      >
        {label}
      </span>
      <AnimatePresence>
        {active && (
          <motion.span
            key="x"
            initial={{ opacity: 0, scale: 0.5, width: 0 }}
            animate={{ opacity: 1, scale: 1, width: 15 }}
            exit={{ opacity: 0, scale: 0.5, width: 0 }}
            transition={{ duration: 0.14 }}
            className="flex h-[15px] w-[15px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2d2d2d]"
          >
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6 6 18"
                stroke="#888888"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
