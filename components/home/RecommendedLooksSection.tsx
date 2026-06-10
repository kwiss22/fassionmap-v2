"use client";

import Link from "next/link";
import { LookCard } from "@/components/home/LookCard";
import { AIChip } from "@/components/ui/AIChip";
import { useRecommendedLooks } from "@/lib/hooks/use-recommended-looks";

/**
 * 홈 AI 룩 — 에디토리얼·이유 중심, 세로 큰 룩 카드 스택.
 */
export function RecommendedLooksSection() {
  const { looks, loading } = useRecommendedLooks(4);
  const visibleLooks = looks.slice(0, 3);

  return (
    <section className="px-5 py-16 lg:px-10 lg:py-24">
      <div className="max-w-2xl">
        <AIChip>AI picks</AIChip>
        <p className="editorial-display mt-5 text-[30px] leading-[1.1] text-on-surface sm:text-[36px]">
          Four looks, four reasons.
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-on-surface-variant">
          Each outfit comes with an AI summary and a why for every key
          piece — read first, shop second.
        </p>
      </div>

      {loading ? (
        <div className="mt-12 flex flex-col gap-14">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="silhouette-bg aspect-[4/5] w-full max-w-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col gap-14 lg:mt-16 lg:gap-20">
          {visibleLooks.map((look) => (
            <LookCard key={look.id} look={look} />
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-outline-variant/40 pt-6">
        <p className="text-[11px] tracking-[0.18em] text-on-surface-variant uppercase">
          More looks on Feed
        </p>
        <Link href="/feed" className="underline-link text-[11px] tracking-[0.2em] uppercase">
          Feed →
        </Link>
      </div>
    </section>
  );
}
