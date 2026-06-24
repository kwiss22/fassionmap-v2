"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { ProductCard } from "@/components/ProductCard";
import { AIChip } from "@/components/ui/AIChip";
import { useSaved } from "@/lib/hooks/use-saved";
import { cn } from "@/lib/utils";

type TabKey = "products" | "looks" | "brands";

const TABS: { key: TabKey; label: string }[] = [
  { key: "products", label: "PRODUCTS" },
  { key: "looks", label: "LOOKS" },
  { key: "brands", label: "BRANDS" },
];

function mallLabel(item: { mallName?: string; mall: string }): string {
  return item.mallName?.trim() || item.mall || "Unknown";
}

export default function SavedPage() {
  const { items } = useSaved();
  const [tab, setTab] = useState<TabKey>("products");
  const [mallFilter, setMallFilter] = useState("all");

  const brands = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) s.add(it.mall);
    return [...s];
  }, [items]);

  const mallFilters = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) {
      const key = mallLabel(it);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [items]);

  const visibleItems = useMemo(() => {
    if (mallFilter === "all") return items;
    return items.filter((it) => mallLabel(it) === mallFilter);
  }, [items, mallFilter]);

  const priceDropItems = useMemo(
    () =>
      items.filter(
        (it) =>
          typeof it.savedPrice === "number" &&
          typeof it.price === "number" &&
          it.savedPrice > it.price
      ),
    [items]
  );

  const avgDropPct = useMemo(() => {
    if (priceDropItems.length === 0) return 0;
    const sum = priceDropItems.reduce(
      (acc, it) =>
        acc + ((it.savedPrice - it.price) / it.savedPrice) * 100,
      0
    );
    return Math.round(sum / priceDropItems.length);
  }, [priceDropItems]);

  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <TopBar title="Saved" showBack showStatusStrip={false} />

      <section className="border-b border-outline-variant">
        <div className="flex px-5">
          {TABS.map((t) => {
            const count =
              t.key === "products"
                ? items.length
                : t.key === "brands"
                  ? brands.length
                  : 0;
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  "relative flex-1 py-3 text-center text-[12px] tracking-[0.18em] transition-colors",
                  active ? "text-on-surface" : "text-on-surface-variant"
                )}
              >
                {t.label} <span className="font-medium">{count || ""}</span>
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-[2px] bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {tab === "products" && (
        <>
          {priceDropItems.length > 0 && (
            <section className="px-5 pt-5">
              <div
                className="flex items-center gap-3 rounded-full border border-outline-variant bg-surface-container-low px-3 py-2.5"
                role="status"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-on-primary">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M12 5v14m0 0-5-5m5 5 5-5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <AIChip>AI ALERT</AIChip>
                <span className="eyebrow-bold text-accent">PRICE DROP</span>
                <span className="ml-auto text-[12px] text-on-surface">
                  <strong className="font-semibold">{priceDropItems.length}</strong>{" "}
                  saved {priceDropItems.length === 1 ? "item" : "items"} down{" "}
                  <strong className="font-semibold text-accent">{avgDropPct}%</strong>{" "}
                  on average
                </span>
              </div>
            </section>
          )}

          {items.length > 0 && mallFilters.length > 1 && (
            <section className="px-5 pt-4">
              <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
                <button
                  type="button"
                  data-active={mallFilter === "all"}
                  className="chip-filter shrink-0"
                  onClick={() => setMallFilter("all")}
                >
                  All{" "}
                  <span className="text-[11px] opacity-80">{items.length}</span>
                </button>
                {mallFilters.map(([mall, count]) => (
                  <button
                    key={mall}
                    type="button"
                    data-active={mallFilter === mall}
                    className="chip-filter shrink-0"
                    onClick={() => setMallFilter(mall)}
                  >
                    {mall}{" "}
                    <span className="text-[11px] opacity-80">{count}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="px-5 pt-4">
            <p className="text-[11px] tracking-[0.22em] text-on-surface">
              {visibleItems.length} ITEMS · Recently saved
            </p>
          </section>

          <section className="px-5 pb-20 pt-5">
            {items.length === 0 ? (
              <EmptyState />
            ) : visibleItems.length === 0 ? (
              <p className="py-16 text-center text-[13px] text-on-surface-variant">
                No saved items from this source.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8">
                {visibleItems.map((item) => {
                  const discountPct =
                    item.savedPrice > item.price
                      ? Math.round(
                          ((item.savedPrice - item.price) / item.savedPrice) *
                            100
                        )
                      : undefined;
                  return (
                    <ProductCard
                      key={item.id}
                      product={item}
                      discountPct={discountPct}
                      originalPrice={
                        item.savedPrice > item.price ? item.savedPrice : undefined
                      }
                    />
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {tab === "looks" && <ComingSoon label="Lookbook" />}
      {tab === "brands" && (
        <section className="px-5 pb-20 pt-8">
          {brands.length === 0 ? (
            <EmptyState />
          ) : (
            <ul className="divide-y divide-outline-variant">
              {brands.map((b) => (
                <li key={b} className="flex items-center justify-between py-4">
                  <span className="text-[14px]">{b}</span>
                  <span className="text-[11px] tracking-[0.22em] text-on-surface-variant">
                    SAVED
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <p className="editorial-display text-[22px]">Nothing saved <em>yet</em>.</p>
      <p className="text-[12px] text-on-surface-variant">
        Tap the heart on any product card to save it here.
      </p>
      <Link
        href="/feed"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-on-surface px-5 py-2.5 text-[11px] tracking-[0.18em]"
      >
        Browse home →
      </Link>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <p className="editorial-display text-[22px]">{label} · Coming soon</p>
      <p className="text-[12px] text-on-surface-variant">
        Season lookbooks curated by editors are coming soon.
      </p>
    </div>
  );
}
