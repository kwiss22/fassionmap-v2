"use client";

import Link from "next/link";
import { LookCard } from "@/components/home/LookCard";
import { useRecommendedLooks } from "@/lib/hooks/use-recommended-looks";

/**
 * 홈 추천 룩 — before: 상품 카드 9열 그리드
 * after: 룩 단위(상·하·아우터·신발) + 추천 이유, 3~4개만
 */
export function RecommendedLooksSection() {
  const { looks, loading } = useRecommendedLooks(4);
  const mobileLooks = looks.slice(0, 2);
  const desktopLooks = looks;

  return (
    <section className="px-5 py-10 lg:px-10 lg:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">FOR YOU</p>
          <h2 className="editorial-display mt-2 text-[28px] leading-tight sm:text-[34px]">
            오늘의 <em className="italic">추천 룩</em>
          </h2>
          <p className="mt-2 max-w-md text-[13px] text-on-surface-variant">
            상품 나열이 아니라, 착장 조합과 이유를 먼저 보여 드립니다.
          </p>
        </div>
        <Link
          href="/feed"
          className="eyebrow-bold hidden shrink-0 underline-link sm:inline"
        >
          FEED에서 더 보기 →
        </Link>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="silhouette-bg aspect-[4/3] w-full animate-pulse border border-outline-variant"
            />
          ))}
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-6 md:hidden">
            {mobileLooks.map((look) => (
              <LookCard key={look.id} look={look} compact />
            ))}
          </div>
          <div className="mt-8 hidden gap-6 md:grid md:grid-cols-2">
            {desktopLooks.map((look) => (
              <LookCard key={look.id} look={look} />
            ))}
          </div>
        </>
      )}

      <Link
        href="/feed"
        className="mt-6 block text-center text-[11px] tracking-[0.2em] text-on-surface-variant uppercase underline-link sm:hidden"
      >
        Feed에서 더 보기 →
      </Link>
    </section>
  );
}
