"use client";

import { useMemo, useState } from "react";
import { BRANDS, type Brand, type BrandCategory } from "@/lib/brands";
import { useFollow } from "@/lib/hooks/use-follow";
import { cn } from "@/lib/utils";

const CATEGORY_LABELS: Record<BrandCategory, string> = {
  luxury: "Luxury",
  contemporary: "Contemporary",
  "italian-heritage": "Italian",
  japanese: "Japanese",
  american: "American",
  denim: "Denim",
  streetwear: "Streetwear",
  sneaker: "Sneaker",
  korean: "Korean",
};

const CATEGORY_ORDER: BrandCategory[] = [
  "luxury",
  "contemporary",
  "italian-heritage",
  "japanese",
  "american",
  "denim",
  "streetwear",
  "sneaker",
  "korean",
];

type BrandPickerProps = {
  /** 빈 상태에서 쓸 때는 true: 상단 헤더를 에디토리얼로 크게. */
  emphasizeHeader?: boolean;
};

/**
 * 모든 브랜드를 카테고리별로 나열하고 팔로우/해제 토글을 제공하는 피커.
 */
export function BrandPicker({ emphasizeHeader = false }: BrandPickerProps) {
  const { has, toggle, items } = useFollow();
  const [filter, setFilter] = useState<BrandCategory | "all">("all");

  const grouped = useMemo(() => {
    const map = new Map<BrandCategory, Brand[]>();
    for (const brand of BRANDS) {
      if (filter !== "all" && brand.category !== filter) continue;
      const arr = map.get(brand.category) ?? [];
      arr.push(brand);
      map.set(brand.category, arr);
    }
    return CATEGORY_ORDER.filter((c) => map.has(c)).map((cat) => ({
      category: cat,
      brands: map.get(cat)!,
    }));
  }, [filter]);

  const followedCount = items.length;

  return (
    <div className="pb-10">
      {emphasizeHeader && (
        <header className="px-5 pb-4 pt-6">
          <p className="eyebrow">GET STARTED</p>
          <h2 className="editorial-display mt-2 text-[30px] italic">
            Follow your brands.
          </h2>
          <p className="mt-2 text-[13px] text-on-surface-variant">
            좋아하는 메종을 팔로우하면, 이곳에 신상·셀렉션이 모여요.
          </p>
        </header>
      )}

      <div className="sticky top-0 z-10 -mb-px border-b border-outline-variant/60 bg-surface/90 backdrop-blur">
        <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto px-5 py-3">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "pill-tag shrink-0",
              filter === "all"
                ? "border-primary bg-primary text-on-primary"
                : "border-outline text-on-surface"
            )}
          >
            ALL · {BRANDS.length}
          </button>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "pill-tag shrink-0",
                filter === cat
                  ? "border-primary bg-primary text-on-primary"
                  : "border-outline text-on-surface"
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      {followedCount > 0 && (
        <p className="px-5 pt-4 text-[11px] tracking-[0.22em] text-on-surface-variant">
          {followedCount} FOLLOWING
        </p>
      )}

      <div className="space-y-8 pt-4">
        {grouped.map(({ category, brands }) => (
          <section key={category} className="px-5">
            <p className="eyebrow-bold">{CATEGORY_LABELS[category]}</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {brands.map((brand) => {
                const active = has(brand.slug);
                return (
                  <button
                    key={brand.slug}
                    type="button"
                    onClick={() => toggle(brand.slug)}
                    aria-pressed={active}
                    className={cn(
                      "group flex items-center justify-between gap-3 border px-4 py-3 text-left transition-colors",
                      active
                        ? "border-primary bg-primary/5"
                        : "border-outline-variant hover:bg-surface-container"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-playfair text-[17px] italic leading-tight">
                        {brand.displayEn}
                      </span>
                      <span className="mt-0.5 block text-[11px] tracking-[0.16em] text-on-surface-variant">
                        {brand.displayKo} · TIER {brand.tier}
                      </span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em] transition-colors",
                        active
                          ? "border-primary bg-primary text-on-primary"
                          : "border-outline text-on-surface"
                      )}
                    >
                      {active ? "FOLLOWING" : "+ FOLLOW"}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
