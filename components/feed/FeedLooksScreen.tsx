"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/product";
import { useRecommendedLooks } from "@/lib/hooks/use-recommended-looks";
import {
  FEED_FILTERS,
  LOOK_FILTER,
  feedGreeting,
  readFitPreference,
  type FeedFilterId,
} from "@/lib/feed-look-meta";
import { FeedLookArticle } from "@/components/feed/FeedLookArticle";
import { FeedQuickView } from "@/components/feed/FeedQuickView";
import { cn } from "@/lib/utils";

const SAVED_LOOKS_KEY = "fashionmap_saved_looks_v1";

function readSavedLooks(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(SAVED_LOOKS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function writeSavedLooks(ids: Set<string>) {
  localStorage.setItem(SAVED_LOOKS_KEY, JSON.stringify([...ids]));
}

export function FeedLooksScreen() {
  const { looks, loading } = useRecommendedLooks(4);
  const [filter, setFilter] = useState<FeedFilterId>("all");
  const [fit, setFit] = useState("Regular");
  const [savedLooks, setSavedLooks] = useState<Set<string>>(() => new Set());
  const [quickView, setQuickView] = useState<Product | null>(null);
  const greeting = feedGreeting();

  useEffect(() => {
    setFit(readFitPreference());
    setSavedLooks(readSavedLooks());
  }, []);

  const filteredLooks = useMemo(() => {
    if (filter === "all") return looks;
    return looks.filter((look) => LOOK_FILTER[look.id] === filter);
  }, [looks, filter]);

  const toggleLookSave = (lookId: string) => {
    setSavedLooks((prev) => {
      const next = new Set(prev);
      if (next.has(lookId)) next.delete(lookId);
      else next.add(lookId);
      writeSavedLooks(next);
      return next;
    });
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-surface text-on-surface">
      <header className="shrink-0 border-b border-outline-variant/60 px-5 pb-3 pt-2.5">
        <div className="flex items-center justify-between">
          <div>
            <p className="mb-0.5 font-mono text-[8px] uppercase tracking-[0.16em] text-on-surface-variant">
              {greeting}
            </p>
            <h1 className="font-playfair text-[22px] font-normal leading-none tracking-tight text-on-surface">
              Fashionmap
            </h1>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-ink px-2.5 py-1.5">
            <span
              className="h-[5px] w-[5px] rounded-full bg-[var(--color-lime)] shadow-[0_0_5px_var(--color-lime)]"
              aria-hidden
            />
            <span className="font-mono text-[9px] font-semibold tracking-[0.06em] text-white">
              #{fit}
            </span>
          </div>
        </div>
      </header>

      <div className="shrink-0 border-b border-outline-variant/40 px-5 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FEED_FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-3.5 py-1.5 font-body text-[11px] transition-colors",
                    active
                      ? "border-ink bg-ink text-white"
                      : "border-outline-variant text-on-surface-variant"
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
          <Link
            href="/feed/following"
            className="shrink-0 font-mono text-[8px] uppercase tracking-[0.12em] text-on-surface-variant underline-offset-2 hover:underline"
          >
            Brands
          </Link>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {loading ? (
          <FeedSkeleton />
        ) : filteredLooks.length === 0 ? (
          <p className="px-5 py-16 text-center font-body text-sm text-on-surface-variant">
            No looks in this filter yet. Try For You.
          </p>
        ) : (
          filteredLooks.map((look, i) => (
            <FeedLookArticle
              key={look.id}
              look={look}
              index={looks.indexOf(look)}
              saved={savedLooks.has(look.id)}
              onToggleSave={() => toggleLookSave(look.id)}
              onProductSelect={setQuickView}
              showDivider={i < filteredLooks.length - 1}
            />
          ))
        )}
        <div className="h-24" aria-hidden />
      </div>

      <FeedQuickView product={quickView} onClose={() => setQuickView(null)} />
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-8 px-5 py-6">
      {[0, 1].map((i) => (
        <div key={i} className="animate-pulse space-y-4">
          <div className="h-3 w-24 rounded bg-surface-container" />
          <div className="h-[360px] rounded-[14px] bg-surface-container" />
          <div className="h-3 w-full rounded bg-surface-container" />
          <div className="flex gap-2">
            {[0, 1, 2].map((j) => (
              <div
                key={j}
                className="h-[210px] w-[132px] shrink-0 rounded-xl bg-surface-container"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
