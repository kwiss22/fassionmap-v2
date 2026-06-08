"use client";

import { TopBar } from "@/components/layout/TopBar";
import { useEffect, useState } from "react";

const PREFS_KEY = "fm.prefs.v1";

type Prefs = {
  priceDropAlert: boolean;
  showDuty: boolean;
  currency: "KRW" | "USD";
};

const DEFAULTS: Prefs = {
  priceDropAlert: true,
  showDuty: true,
  currency: "KRW",
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

export default function MePage() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hydration: 서버 첫 페인트는 DEFAULTS, 마운트 후 localStorage 반영.
    const id = requestAnimationFrame(() => {
      setPrefs(loadPrefs());
      setMounted(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  function update<K extends keyof Prefs>(key: K, value: Prefs[K]) {
    setPrefs((prev) => {
      const next = { ...prev, [key]: value };
      savePrefs(next);
      return next;
    });
  }

  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <TopBar title="My" showStatusStrip={false} />

      <section className="px-5 pt-8">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container">
            <span className="editorial-serif text-[22px] italic">F</span>
          </div>
          <div>
            <p className="editorial-display text-[22px]">My Fashionmap</p>
            <p className="mt-1 text-[13px] leading-relaxed text-on-surface-variant">
              가격 알림·표시 방식을 취향에 맞게 조정해 보세요.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-10 px-5">
        <p className="eyebrow">보기 설정</p>
        <ul className="mt-4 divide-y divide-outline-variant border-y border-outline-variant">
          <Toggle
            label="가격 인하 알림"
            hint="찜한 상품 가격이 떨어지면 배너로 알려드려요."
            value={prefs.priceDropAlert}
            onChange={(v) => update("priceDropAlert", v)}
            disabled={!mounted}
          />
          <Toggle
            label="관세·배송비 포함 표시"
            hint="해외 몰 상품 가격에 예상 관세/배송을 합산해 보여줍니다."
            value={prefs.showDuty}
            onChange={(v) => update("showDuty", v)}
            disabled={!mounted}
          />
          <li className="flex items-center justify-between py-4">
            <div>
              <p className="text-[14px]">통화</p>
              <p className="text-[11px] text-on-surface-variant">
                표시 가격 단위
              </p>
            </div>
            <div className="flex gap-1">
              {(["KRW", "USD"] as const).map((c) => (
                <button
                  key={c}
                  type="button"
                  data-active={prefs.currency === c}
                  className="chip-filter"
                  onClick={() => update("currency", c)}
                  disabled={!mounted}
                >
                  {c}
                </button>
              ))}
            </div>
          </li>
        </ul>
      </section>

      <section className="mt-10 px-5">
        <p className="eyebrow">ABOUT</p>
        <ul className="mt-4 space-y-3 text-[13px]">
          <li className="flex justify-between border-b border-outline-variant/70 pb-3">
            <span>버전</span>
            <span className="text-on-surface-variant">0.2.0 · Editorial</span>
          </li>
        </ul>
      </section>
    </main>
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
        className={
          "relative h-7 w-12 rounded-full border transition-colors " +
          (value
            ? "border-primary bg-primary"
            : "border-outline-variant bg-surface-container")
        }
      >
        <span
          className={
            "absolute top-0.5 h-5 w-5 rounded-full bg-surface transition-transform " +
            (value ? "translate-x-[22px]" : "translate-x-0.5")
          }
        />
      </button>
    </li>
  );
}
