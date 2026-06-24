"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { useSaved } from "@/lib/hooks/use-saved";
import {
  readFitPreference,
  readVibeLabels,
  readVibePreferences,
  resetOnboardingForDev,
} from "@/lib/onboarding-preferences";
import { cn } from "@/lib/utils";

const PREFS_KEY = "fm.prefs.v1";

type Prefs = {
  priceDropAlert: boolean;
  showDuty: boolean;
  currency: "KRW" | "USD";
};

const DEFAULTS: Prefs = {
  priceDropAlert: true,
  showDuty: true,
  currency: "USD",
};

function loadPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

function savePrefs(p: Prefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREFS_KEY, JSON.stringify(p));
}

export function ProfileScreen() {
  const router = useRouter();
  const { items: saved } = useSaved();
  const [fit, setFit] = useState("Regular");
  const [vibeLabels, setVibeLabels] = useState<string[]>([]);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setFit(readFitPreference());
      setVibeLabels(readVibeLabels(readVibePreferences()));
      setPrefs(loadPrefs());
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function updatePrefs<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      savePrefs(next);
      return next;
    });
  }

  function recalibrate() {
    resetOnboardingForDev();
    router.push("/onboarding");
  }

  return (
    <div className="flex min-h-[100dvh] flex-col bg-surface text-on-surface">
      <header className="border-b border-outline-variant/60 px-5 pb-3 pt-4">
        <div className="mb-1 flex items-center gap-1.5">
          <div className="flex h-4 w-4 items-center justify-center rounded-[5px] bg-[var(--color-lime)]">
            <SparklesIcon className="h-2.5 w-2.5 text-ink" />
          </div>
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-on-surface-variant">
            Fashionmap · Profile
          </span>
        </div>
        <h1 className="font-playfair text-[28px] font-normal tracking-tight">
          Your <em className="not-italic text-on-surface-variant">Style DNA</em>
        </h1>
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-24 pt-6">
        <section className="fm-card p-5">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-on-surface-variant">
            Fit preference
          </p>
          <p className="mt-2 font-playfair text-2xl">{fit}</p>
          {vibeLabels.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {vibeLabels.map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-outline-variant/80 px-3 py-1 font-mono text-[9px] tracking-[0.06em] text-on-surface-variant"
                >
                  {label}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-[13px] text-on-surface-variant">
              No vibes saved yet. Complete onboarding to personalize your feed.
            </p>
          )}
          <button
            type="button"
            onClick={recalibrate}
            className="mt-5 inline-flex h-10 w-full items-center justify-center border border-on-surface bg-on-surface font-mono text-[9px] uppercase tracking-[0.14em] text-on-primary-container transition-opacity hover:opacity-90"
          >
            Recalibrate AI setup
          </button>
        </section>

        <section className="mt-8">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-on-surface-variant">
            Saved
          </p>
          <Link
            href="/saved"
            className="fm-card mt-3 flex items-center justify-between p-5 transition-opacity hover:opacity-90"
          >
            <div>
              <p className="font-body text-[15px] font-medium">Saved looks & items</p>
              <p className="mt-1 text-[12px] text-on-surface-variant">
                {saved.length === 0
                  ? "Nothing saved yet"
                  : `${saved.length} item${saved.length === 1 ? "" : "s"} in your list`}
              </p>
            </div>
            <ChevronIcon />
          </Link>
        </section>

        <section className="mt-10">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-on-surface-variant">
            Display
          </p>
          <ul className="mt-4 divide-y divide-outline-variant border-y border-outline-variant">
            <Toggle
              label="Price drop alerts"
              hint="Banner when a saved item's price goes down."
              value={prefs.priceDropAlert}
              onChange={(v) => updatePrefs("priceDropAlert", v)}
              disabled={!mounted}
            />
            <Toggle
              label="Include duties & shipping"
              hint="Estimated duties and shipping on global items."
              value={prefs.showDuty}
              onChange={(v) => updatePrefs("showDuty", v)}
              disabled={!mounted}
            />
            <li className="flex items-center justify-between py-4">
              <div>
                <p className="text-[14px]">Currency</p>
                <p className="text-[11px] text-on-surface-variant">
                  Price display unit
                </p>
              </div>
              <div className="flex gap-1">
                {(["KRW", "USD"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    data-active={prefs.currency === c}
                    className={cn(
                      "chip-filter",
                      prefs.currency === c && "border-on-surface bg-on-surface text-on-primary-container"
                    )}
                    onClick={() => updatePrefs("currency", c)}
                    disabled={!mounted}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-on-surface-variant">
            About
          </p>
          <ul className="mt-4 space-y-3 text-[13px]">
            <li className="flex justify-between border-b border-outline-variant/70 pb-3">
              <span>Version</span>
              <span className="text-on-surface-variant">0.2.1 · v2.1</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
  disabled,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <li className="flex items-center justify-between py-4">
      <div className="pr-6">
        <p className="text-[14px]">{label}</p>
        {hint && (
          <p className="mt-0.5 text-[11px] text-on-surface-variant">{hint}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={cn(
          "relative h-7 w-12 rounded-full border transition-colors",
          value
            ? "border-primary bg-primary"
            : "border-outline-variant bg-surface-container"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-transform",
            value ? "translate-x-[22px]" : "translate-x-0.5"
          )}
        />
      </button>
    </li>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
