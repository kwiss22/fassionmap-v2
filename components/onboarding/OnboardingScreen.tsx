"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BODY_FIT_OPTIONS,
  VIBE_OPTIONS,
  type BodyFitId,
} from "@/lib/onboarding-preferences";
import { BodyFitIcon } from "@/components/onboarding/BodyFitIcon";
import { OnboardingVibeChip } from "@/components/onboarding/OnboardingVibeChip";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { cn } from "@/lib/utils";

type OnboardingScreenProps = {
  onComplete: (fitId: BodyFitId, vibeIds: string[]) => void;
};

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [bodyType, setBodyType] = useState<BodyFitId | null>(null);
  const [activeVibes, setActiveVibes] = useState<Set<string>>(new Set());

  const toggleVibe = (id: string) => {
    setActiveVibes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canSubmit = bodyType !== null && activeVibes.size > 0;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-surface">
      <div className="flex-1 overflow-y-auto px-[26px] pb-36 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="mb-6 flex items-center gap-1.5 pt-[18px]">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "h-0.5 rounded-sm",
                step === 1 ? "flex-[2] bg-ink" : "flex-1 bg-outline-variant/80"
              )}
              aria-hidden
            />
          ))}
          <span className="shrink-0 font-mono text-[9px] tracking-[0.08em] text-on-surface-variant">
            1 / 3
          </span>
        </div>

        <div className="mb-2.5 flex items-center gap-1.5">
          <div className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-[var(--color-lime)]">
            <SparklesIcon className="h-2.5 w-2.5 text-ink" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-on-surface-variant">
            Fassionmap · AI Setup
          </span>
        </div>

        <h1 className="mb-1.5 font-playfair text-[30px] font-normal leading-tight tracking-tight text-on-surface">
          Tune Your
          <br />
          <em className="not-italic text-on-surface-variant">AI Stylist.</em>
        </h1>
        <p className="mb-8 font-body text-[13px] font-light leading-relaxed text-on-surface-variant">
          A few quick preferences to build a feed that feels made for you.
        </p>

        <p className="mb-1 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Section 01
        </p>
        <h2 className="mb-3.5 font-playfair text-xl font-normal tracking-tight text-on-surface">
          Fit Preference
        </h2>
        <div className="mb-7 flex gap-2.5">
          {BODY_FIT_OPTIONS.map((item) => {
            const selected = bodyType === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={() => setBodyType(item.id)}
                className={cn(
                  "relative flex min-h-[140px] flex-1 flex-col items-center justify-end gap-2.5 rounded-[14px] border px-2 pb-4 pt-5 transition-all",
                  selected
                    ? "border-2 border-ink bg-surface-container shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
                    : "border-[1.5px] border-outline-variant/80 bg-[#fdfdfd]"
                )}
              >
                <AnimatePresence>
                  {selected && (
                    <motion.span
                      key="tick"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 26 }}
                      className="absolute right-2.5 top-2.5 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-ink"
                    >
                      <CheckIcon />
                    </motion.span>
                  )}
                </AnimatePresence>
                <div className="flex h-20 items-end">
                  <BodyFitIcon id={item.id} active={selected} />
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "mb-0.5 font-body text-xs font-semibold",
                      selected ? "text-on-surface" : "text-on-surface-variant"
                    )}
                  >
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "font-mono text-[8px] uppercase tracking-[0.1em]",
                      selected ? "text-on-surface-variant" : "text-outline-variant"
                    )}
                  >
                    {item.sub}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="mb-7 h-px bg-outline-variant/60" />

        <p className="mb-1 font-body text-[11px] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Section 02
        </p>
        <h2 className="mb-3.5 font-playfair text-xl font-normal tracking-tight text-on-surface">
          Preferred Vibe
        </h2>
        <div className="mb-8 flex flex-wrap gap-2">
          {VIBE_OPTIONS.map((v) => (
            <OnboardingVibeChip
              key={v.id}
              label={v.label}
              active={activeVibes.has(v.id)}
              onToggle={() => toggleVibe(v.id)}
            />
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface from-65% to-transparent px-[26px] pb-9 pt-4">
        <div className="pointer-events-auto">
          <AnimatePresence>
            {!canSubmit && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-2.5 text-center font-body text-[11px] text-outline-variant"
              >
                {!bodyType
                  ? "Select a body fit to continue"
                  : "Choose at least one vibe"}
              </motion.p>
            )}
          </AnimatePresence>
          <motion.button
            type="button"
            whileTap={canSubmit ? { scale: 0.985 } : undefined}
            disabled={!canSubmit}
            onClick={() => {
              if (bodyType && canSubmit) {
                onComplete(bodyType, [...activeVibes]);
              }
            }}
            className={cn(
              "relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-[14px] border-0 py-4 transition-colors",
              canSubmit
                ? "cursor-pointer bg-ink"
                : "cursor-not-allowed bg-outline-variant/60"
            )}
          >
            {canSubmit && (
              <span
                className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[rgba(184,255,46,0.09)] to-transparent"
                aria-hidden
              />
            )}
            <SparklesIcon
              className={cn(
                "h-[15px] w-[15px]",
                canSubmit ? "text-[var(--color-lime)]" : "text-on-surface-variant"
              )}
            />
            <span
              className={cn(
                "font-body text-[15px] font-semibold transition-colors",
                canSubmit ? "text-white" : "text-on-surface-variant"
              )}
            >
              Calibrate My Feed
            </span>
            <ChevronRightIcon active={canSubmit} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12l5 5L20 7"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon({ active }: { active: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke={active ? "#ffffff" : "#c0c0c0"}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
