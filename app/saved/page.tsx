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

const FILTERS = [
  { key: "all", label: "전체" },
  { key: "office", label: "오피스" },
  { key: "guest", label: "하객룩" },
  { key: "winter-outer", label: "겨울 아우터" },
  { key: "daily", label: "데일리" },
];

export default function SavedPage() {
  const { items } = useSaved();
  const [tab, setTab] = useState<TabKey>("products");
  const [filter, setFilter] = useState<string>("all");

  const brands = useMemo(() => {
    const s = new Set<string>();
    for (const it of items) s.add(it.mall);
    return [...s];
  }, [items]);

  // 가격 인하: 현재는 savedPrice 기준으로만 (실데이터 없으면 0).
  // 시안 데모용으로 아이템 수가 있을 때 가상 평균 14% 인하 배너 표시.
  const priceDropItems = items.filter(
    (it) =>
      typeof it.savedPrice === "number" &&
      typeof it.price === "number" &&
      it.savedPrice > it.price
  );
  const demoPriceDrop = items.length >= 3;

  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <TopBar title="Saved" showBack right={<MoreMenu />} showStatusStrip={false} />

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
          {(priceDropItems.length > 0 || demoPriceDrop) && (
            <section className="px-5 pt-5">
              <Link
                href="#"
                className="flex items-center gap-3 rounded-full border border-outline-variant bg-surface-container-low px-3 py-2.5"
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
                <span className="ml-auto flex items-center gap-1 text-[12px] text-on-surface">
                  찜한{" "}
                  <strong className="font-semibold">
                    {priceDropItems.length || 3}개
                  </strong>{" "}
                  상품이 평균{" "}
                  <strong className="font-semibold text-accent">14%</strong>{" "}
                  내렸어요
                  <span aria-hidden>›</span>
                </span>
              </Link>
            </section>
          )}

          <section className="px-5 pt-4">
            <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  data-active={filter === f.key}
                  className="chip-filter"
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}{" "}
                  {f.key === "all" && (
                    <span className="text-[11px] opacity-80">{items.length}</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="px-5 pt-4">
            <div className="flex items-center justify-between text-[11px] tracking-[0.22em]">
              <span className="text-on-surface">
                {items.length} ITEMS · 최근 저장순
              </span>
              <button type="button" className="text-on-surface-variant">
                FILTER ▽
              </button>
            </div>
          </section>

          <section className="px-5 pb-20 pt-5">
            {items.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="grid grid-cols-2 gap-x-3 gap-y-8">
                {items.map((item) => {
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
                    FOLLOWING
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
        상품 카드의 하트를 눌러 여기에 모아보세요.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-on-surface px-5 py-2.5 text-[11px] tracking-[0.18em]"
      >
        HOME 둘러보기 →
      </Link>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <p className="editorial-display text-[22px]">{label} · Coming soon</p>
      <p className="text-[12px] text-on-surface-variant">
        곧 에디터가 엮은 시즌 룩북을 모아볼 수 있습니다.
      </p>
    </div>
  );
}

function MoreMenu() {
  return (
    <button type="button" aria-label="더보기" className="p-1">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="6" cy="12" r="1.5" fill="currentColor" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
        <circle cx="18" cy="12" r="1.5" fill="currentColor" />
      </svg>
    </button>
  );
}
