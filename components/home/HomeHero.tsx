import Link from "next/link";
import { AIChip } from "@/components/ui/AIChip";

/**
 * 홈 Hero — before: 풀블리드 매거진 커버 + 다중 CTA
 * after: 타이포 중심, AI 스타일링 1차 행동만 강조
 */
export function HomeHero() {
  return (
    <section className="border-b border-outline-variant/60 px-5 pb-12 pt-10 lg:px-10 lg:pb-16 lg:pt-14">
      <AIChip>AI 스타일링</AIChip>
      <h1 className="editorial-display mt-5 max-w-xl text-[34px] leading-[1.06] sm:text-[44px] lg:text-[52px]">
        오늘 입을 옷,
        <br />
        <span className="italic">AI가 바로 골라드립니다.</span>
      </h1>
      <p className="mt-4 max-w-md text-[14px] leading-relaxed text-on-surface-variant">
        체형, 일정, 날씨, 예산까지 반영한 개인 스타일 추천.
        <span className="hidden sm:inline">
          {" "}
          Quiet luxury 톤은 유지하되, 홈에서는 추천이 먼저입니다.
        </span>
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href="#styling-agent"
          className="inline-flex h-12 items-center justify-center bg-on-surface px-8 text-[12px] font-medium tracking-[0.22em] text-on-primary-container uppercase transition-opacity hover:opacity-90"
        >
          AI에게 추천받기
        </Link>
        <Link
          href="/saved?tab=looks"
          className="inline-flex h-12 items-center justify-center border border-outline-variant px-6 text-[12px] font-medium tracking-[0.2em] text-on-surface uppercase transition-colors hover:border-on-surface"
        >
          저장한 룩 보기
        </Link>
      </div>
    </section>
  );
}
