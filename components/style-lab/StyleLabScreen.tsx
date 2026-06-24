"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { AiSearchCuratedItem } from "@/lib/ai/types";
import { APP_MARKET } from "@/lib/market";
import { readFitPreference } from "@/lib/feed-look-meta";
import { useStyleLabWardrobe } from "@/lib/hooks/use-style-lab-wardrobe";
import {
  LAB_CATEGORIES,
  LAB_SLOT_HEIGHT,
  buildAiOutfitPrompt,
  inferLabCategory,
  labBrandLabel,
  pickRandom,
  type LabCategory,
  type LabWardrobeItem,
} from "@/lib/style-lab";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { cn } from "@/lib/utils";

type Slots = Record<LabCategory, LabWardrobeItem | null>;

const EMPTY_SLOTS: Slots = {
  Top: null,
  Bottom: null,
  Shoes: null,
  Accessory: null,
};

export function StyleLabScreen() {
  const { items, loading, error, byCategory } = useStyleLabWardrobe();
  const [slots, setSlots] = useState<Slots>(EMPTY_SLOTS);
  const [tab, setTab] = useState<LabCategory>("Top");
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [fit, setFit] = useState("Regular");

  useEffect(() => {
    setFit(readFitPreference());
  }, []);

  const tabItems = useMemo(() => byCategory(tab), [byCategory, tab]);
  const placedIds = useMemo(
    () =>
      new Set(
        Object.values(slots)
          .filter(Boolean)
          .map((item) => item!.id)
      ),
    [slots]
  );

  const clearSlots = () => setSlots(EMPTY_SLOTS);

  const shuffleSlots = useCallback(() => {
    setGenError(null);
    setSlots({
      Top: pickRandom(byCategory("Top")),
      Bottom: pickRandom(byCategory("Bottom")),
      Shoes: pickRandom(byCategory("Shoes")),
      Accessory: pickRandom(byCategory("Accessory")),
    });
  }, [byCategory]);

  const assignFromAiItems = useCallback(
    (curated: AiSearchCuratedItem[]) => {
      const next: Slots = { ...EMPTY_SLOTS };
      for (const entry of curated) {
        const cat = inferLabCategory(entry.product);
        if (!next[cat]) {
          next[cat] = {
            id: `${cat}-${entry.product.id}`,
            category: cat,
            product: entry.product,
          };
        }
      }
      for (const cat of LAB_CATEGORIES) {
        if (!next[cat]) next[cat] = pickRandom(byCategory(cat));
      }
      setSlots(next);
    },
    [byCategory]
  );

  const generateOutfit = useCallback(async () => {
    if (items.length === 0) return;
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: buildAiOutfitPrompt(fit),
          locale: APP_MARKET.locale,
        }),
      });
      const json = (await res.json()) as {
        ok: boolean;
        data?: { items: AiSearchCuratedItem[] };
        error?: string;
      };
      if (!res.ok || !json.ok || !json.data?.items?.length) {
        shuffleSlots();
        setGenError(json.error ?? "AI unavailable — shuffled from wardrobe.");
        return;
      }
      assignFromAiItems(json.data.items);
    } catch {
      shuffleSlots();
      setGenError("Network error — shuffled from wardrobe.");
    } finally {
      setGenerating(false);
    }
  }, [items.length, fit, shuffleSlots, assignFromAiItems]);

  const togglePin = (id: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="app-tab-screen flex flex-col overflow-hidden bg-[#060a08] text-[#e8f0eb]">
      <header className="flex shrink-0 items-center justify-between border-b border-[rgba(57,255,122,0.07)] px-5 pb-3 pt-2.5">
        <div>
          <p className="mb-0.5 font-mono text-[7px] uppercase tracking-[0.16em] text-[#1e3022]">
            Fashionmap
          </p>
          <h1 className="display-caps text-xl text-[#e8f0eb]">
            Style Lab
          </h1>
        </div>
        <div className="flex gap-1.5">
          <LabHeaderButton onClick={clearSlots} label="Clear">
            <RotateIcon />
          </LabHeaderButton>
          <LabHeaderButton onClick={shuffleSlots} label="Shuffle" disabled={loading}>
            <ShuffleIcon className={generating ? "spin-lab" : ""} />
          </LabHeaderButton>
        </div>
      </header>

      <section className="shrink-0 px-5 pt-2 pb-1">
        <div className="mb-2 flex items-center justify-between">
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#1e3022]">
            Canvas
          </span>
          <div className="flex gap-1">
            {LAB_CATEGORIES.map((cat) => (
              <span
                key={cat}
                className={cn(
                  "h-0.5 w-[22px] rounded-sm transition-all",
                  slots[cat]
                    ? "bg-[var(--color-neon)] shadow-[0_0_4px_var(--color-neon)]"
                    : "bg-[#141e16]"
                )}
                aria-hidden
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          {LAB_CATEGORIES.map((cat) => (
            <CanvasRow
              key={cat}
              category={cat}
              item={slots[cat]}
              onRemove={() => setSlots((p) => ({ ...p, [cat]: null }))}
            />
          ))}
        </div>

        <div className="my-2.5 flex justify-center">
          <button
            type="button"
            disabled={generating || loading}
            onClick={() => void generateOutfit()}
            className="inline-flex items-center gap-1.5 rounded-full border-0 bg-[var(--color-neon)] px-5 py-2.5 shadow-[0_0_20px_rgba(57,255,122,0.25)] disabled:cursor-not-allowed disabled:opacity-80"
          >
            {generating ? (
              <span className="spin-lab h-3 w-3 rounded-full border-2 border-[rgba(6,10,8,0.3)] border-t-[#060a08]" />
            ) : (
              <SparklesIcon className="h-3 w-3 text-[#060a08]" />
            )}
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-[#060a08]">
              {generating ? "Generating…" : "Generate Outfit by AI"}
            </span>
          </button>
        </div>
        {genError ? (
          <p className="mb-2 text-center font-body text-[10px] text-[#5a7060]">
            {genError}
          </p>
        ) : null}
      </section>

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden border-t border-[rgba(57,255,122,0.07)]">
        <div
          className="flex shrink-0 border-b border-[rgba(57,255,122,0.06)]"
          role="tablist"
          aria-label="Wardrobe category"
        >
          {LAB_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={tab === cat}
              onClick={() => setTab(cat)}
              className={cn(
                "flex-1 border-0 bg-transparent py-2 font-body text-[11px] transition-colors",
                tab === cat
                  ? "border-b-2 border-[var(--color-neon)] font-medium text-[#e8f0eb]"
                  : "border-b-2 border-transparent text-[#1e3022]"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-2.5 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {loading ? (
            <WardrobeSkeleton />
          ) : error ? (
            <p className="py-10 text-center font-body text-xs text-[#5a7060]">
              {error}
            </p>
          ) : tabItems.length === 0 ? (
            <p className="py-10 text-center font-body text-xs text-[#5a7060]">
              No items in this category.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {tabItems.map((item) => {
                const isPlaced = placedIds.has(item.id);
                const isPinned = pinned.has(item.id);
                return (
                  <WardrobeTile
                    key={item.id}
                    item={item}
                    isPlaced={isPlaced}
                    isPinned={isPinned}
                    onAssign={() =>
                      setSlots((p) => ({ ...p, [item.category]: item }))
                    }
                    onTogglePin={() => togglePin(item.id)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function LabHeaderButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-0.5 rounded-full border border-[rgba(57,255,122,0.12)] bg-transparent px-2.5 py-1.5 font-mono text-[7px] uppercase tracking-[0.1em] text-[#2a4030] disabled:opacity-50"
    >
      {children}
      {label}
    </button>
  );
}

function CanvasRow({
  category,
  item,
  onRemove,
}: {
  category: LabCategory;
  item: LabWardrobeItem | null;
  onRemove: () => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg border px-3 py-2 transition-colors",
        item
          ? "border-[rgba(57,255,122,0.2)] bg-[#0a1009]"
          : "border-[rgba(57,255,122,0.07)] bg-[#080d09]"
      )}
    >
      <span className="w-12 shrink-0 font-mono text-[7px] uppercase tracking-[0.12em] text-[#1e3022]">
        {category}
      </span>
      <div
        className="relative w-[50px] shrink-0 overflow-hidden rounded-md border border-[rgba(57,255,122,0.06)] bg-[#111a13]"
        style={{ height: LAB_SLOT_HEIGHT[category] }}
      >
        {item ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            className="object-cover"
            sizes="50px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="h-px w-[18px] bg-[rgba(57,255,122,0.1)]" />
          </div>
        )}
      </div>
      {item ? (
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 font-mono text-[7px] uppercase tracking-[0.08em] text-[#1e3022]">
            {labBrandLabel(item.product)}
          </p>
          <p className="line-clamp-2 font-body text-[10px] leading-snug text-[#c8d8cc]">
            {item.product.name}
          </p>
          <button
            type="button"
            onClick={onRemove}
            className="mt-0.5 inline-flex items-center gap-0.5 border-0 bg-transparent p-0 font-mono text-[7px] uppercase text-[#1e3022]"
          >
            <XIcon size={6} /> Remove
          </button>
        </div>
      ) : (
        <p className="font-body text-[10px] italic text-[#1e3022]">
          Add {category}
        </p>
      )}
    </div>
  );
}

function WardrobeTile({
  item,
  isPlaced,
  isPinned,
  onAssign,
  onTogglePin,
}: {
  item: LabWardrobeItem;
  isPlaced: boolean;
  isPinned: boolean;
  onAssign: () => void;
  onTogglePin: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onAssign}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAssign();
        }
      }}
      className={cn(
        "cursor-pointer overflow-hidden rounded-lg border-[1.5px] bg-[#0d1410] transition-colors",
        isPlaced
          ? "border-[var(--color-neon)]"
          : isPinned
            ? "border-[#e8f0eb]"
            : "border-[rgba(57,255,122,0.09)]"
      )}
    >
      <div className="relative h-[92px] bg-[#111a13]">
        <Image
          src={item.product.imageUrl}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="33vw"
        />
        {isPlaced && (
          <span className="absolute right-1 top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[var(--color-neon)]">
            <CheckIcon />
          </span>
        )}
      </div>
      <div className="flex items-start justify-between gap-1 px-1.5 py-1.5 pb-2">
        <div className="min-w-0 flex-1">
          <p className="mb-0.5 truncate font-mono text-[6px] uppercase tracking-[0.1em] text-[#1e3022]">
            {labBrandLabel(item.product)}
          </p>
          <p className="truncate font-body text-[9px] text-[#c8d8cc]">
            {item.product.name}
          </p>
        </div>
        <button
          type="button"
          aria-label={isPinned ? "Unpin item" : "Pin item"}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={cn(
            "mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded border",
            isPinned
              ? "border-[#e8f0eb] bg-[#e8f0eb]"
              : "border-[rgba(57,255,122,0.15)] bg-transparent"
          )}
        >
          {isPinned ? (
            <CheckIcon dark />
          ) : (
            <GripIcon />
          )}
        </button>
      </div>
    </div>
  );
}

function WardrobeSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-lg border border-[rgba(57,255,122,0.09)] bg-[#0d1410]"
        >
          <div className="h-[92px] bg-[#111a13]" />
          <div className="space-y-1 px-1.5 py-2">
            <div className="h-2 w-2/3 rounded bg-[#141e16]" />
            <div className="h-2 w-full rounded bg-[#141e16]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function RotateIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 12a9 9 0 0 1 15-6.7L21 8M21 3v5h-5M21 12a9 9 0 0 1-15 6.7L3 16M3 21v-5H8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShuffleIcon({ className }: { className?: string }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon({ dark }: { dark?: boolean }) {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 12l5 5L20 7"
        stroke={dark ? "#060a08" : "#060a08"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="9" cy="6" r="1.2" fill="#1e3022" />
      <circle cx="15" cy="6" r="1.2" fill="#1e3022" />
      <circle cx="9" cy="12" r="1.2" fill="#1e3022" />
      <circle cx="15" cy="12" r="1.2" fill="#1e3022" />
      <circle cx="9" cy="18" r="1.2" fill="#1e3022" />
      <circle cx="15" cy="18" r="1.2" fill="#1e3022" />
    </svg>
  );
}

function XIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
