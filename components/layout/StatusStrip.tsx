"use client";

import Link from "next/link";
import { CURRENT_ISSUE } from "@/lib/editorial";
import { useFollow } from "@/lib/hooks/use-follow";
import { useSaved } from "@/lib/hooks/use-saved";
import { SparklesIcon } from "@/components/ui/SparklesIcon";

/**
 * TopBar 아래 sticky하게 떠 있는 매우 얇은 상태 strip.
 *
 * "이 사이트는 매주 업데이트되는 발행물(매거진/큐레이션)이다"라는 신호를
 * 모든 페이지에서 일관되게 깐다. 회귀하는 platform 정체성의 핵심 장치.
 *
 * 좌측: VOL / SEASON / UPDATED — 발행물의 issue 식별자.
 * 우측: 사용자의 관여도(NEW · FOLLOWING · SAVED)가 있다면 표기.
 *       데스크톱은 모두 표기, 모바일은 NEW만 우선 노출(공간 제약).
 */
export function StatusStrip() {
  const { items: saved } = useSaved();
  const { items: followed } = useFollow();
  const newCount = WEEKLY_NEW_COUNT;

  return (
    <div className="border-b border-outline-variant/70 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-7 items-center justify-between px-5 text-[10px] tracking-[0.22em] text-on-surface-variant lg:px-8">
        <div className="flex items-center gap-3">
          <span className="font-medium text-on-surface">
            VOL.&nbsp;{CURRENT_ISSUE.vol}
          </span>
          <span aria-hidden className="opacity-50">·</span>
          <span>{CURRENT_ISSUE.season}</span>
          <span aria-hidden className="hidden opacity-50 sm:inline">·</span>
          <span className="hidden sm:inline">UPDATED 2H AGO</span>
        </div>
        <div className="flex min-w-0 flex-wrap items-center justify-end gap-x-3 gap-y-1 sm:flex-nowrap">
          <Link
            href="/search"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-indigo-200/70 bg-[var(--color-ai-surface)] px-2 py-0.5 text-[9px] font-medium tracking-[0.12em] text-[var(--color-ai)] transition-colors hover:border-indigo-300"
          >
            <SparklesIcon className="h-2.5 w-2.5 shrink-0 opacity-90" />
            AI 검색
          </Link>
          <span aria-hidden className="hidden opacity-50 sm:inline">
            ·
          </span>
          <span className="text-accent">{newCount} NEW THIS WEEK</span>
          <span aria-hidden className="hidden opacity-50 sm:inline">·</span>
          <span className="hidden sm:inline">
            FOLLOWING&nbsp;
            <span className="font-medium text-on-surface tabular-nums">
              {followed.length}
            </span>
          </span>
          <span aria-hidden className="hidden opacity-50 sm:inline">·</span>
          <span className="hidden sm:inline">
            SAVED&nbsp;
            <span className="font-medium text-on-surface tabular-nums">
              {saved.length}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// 추후 lib/editorial.ts로 이동하거나 실제 데이터 기반으로 계산.
// 지금은 매거진 신호로만 쓰는 placeholder 상수.
const WEEKLY_NEW_COUNT = 23;
