"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { VIBE_OPTIONS } from "@/lib/onboarding-preferences";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { cn } from "@/lib/utils";

type OnboardingLoadingScreenProps = {
  fit: string;
};

export function OnboardingLoadingScreen({ fit }: OnboardingLoadingScreenProps) {
  const [visible, setVisible] = useState<Record<number, boolean>>({});
  const [dots, setDots] = useState("...");

  useEffect(() => {
    const init: Record<number, boolean> = {};
    VIBE_OPTIONS.forEach((_, i) => {
      init[i] = i < 6;
    });
    setVisible(init);

    const iv = setInterval(() => {
      setVisible((prev) => {
        const next = { ...prev };
        VIBE_OPTIONS.map((_, i) => i)
          .sort(() => Math.random() - 0.5)
          .slice(0, 2)
          .forEach((i) => {
            next[i] = !prev[i];
          });
        return next;
      });
    }, 900);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const seq = [".", "..", "..."];
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % seq.length;
      setDots(seq[i] ?? "...");
    }, 480);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-[100dvh] overflow-y-auto bg-surface px-6 py-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="mb-6 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 22 }}
          className="mb-[18px] flex h-16 w-16 items-center justify-center rounded-full bg-ink"
        >
          <SparklesIcon className="h-[26px] w-[26px] text-[var(--color-lime)]" />
        </motion.div>
        <h1 className="mb-2 font-playfair text-2xl font-normal leading-snug text-on-surface">
          Your AI Stylist
          <br />
          <em className="not-italic text-on-surface-variant">
            is calibrating{dots}
          </em>
        </h1>
        <div className="inline-flex items-center gap-1 rounded-full bg-surface-container px-3 py-1">
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-on-surface-variant">
            Fit ·
          </span>
          <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-on-surface">
            {fit}
          </span>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-1.5">
        {VIBE_OPTIONS.map((v, i) => (
          <span
            key={v.id}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[9px] tracking-[0.08em] transition-all duration-700",
              visible[i]
                ? "border-ink bg-surface-container text-on-surface opacity-100"
                : "border-outline-variant text-on-surface-variant opacity-40"
            )}
          >
            {v.label}
          </span>
        ))}
      </div>

      {[0, 150, 300].map((d) => (
        <div
          key={d}
          className="mb-2 flex gap-2.5 rounded-[10px] border border-outline-variant/60 bg-surface-container p-2.5"
          style={{ animationDelay: `${d}ms` }}
        >
          <div className="h-[72px] w-[60px] shrink-0 animate-pulse rounded-md bg-outline-variant/40" />
          <div className="flex flex-1 flex-col justify-center gap-1.5">
            <div className="h-2 w-[70%] animate-pulse rounded bg-outline-variant/40" />
            <div className="h-1.5 w-1/2 animate-pulse rounded bg-outline-variant/30" />
            <div className="h-2 w-[30%] animate-pulse rounded bg-outline-variant/30" />
          </div>
        </div>
      ))}
    </div>
  );
}
