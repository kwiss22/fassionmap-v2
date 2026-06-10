"use client";

import { CURRENT_ISSUE } from "@/lib/editorial";
import { useSaved } from "@/lib/hooks/use-saved";

/**
 * TopBar 아래 얇은 발행·저장 상태 strip.
 * 좌: VOL · SEASON / 우: SAVED count만 — 중복 트래킹 라벨 최소화.
 */
export function StatusStrip() {
  const { items: saved } = useSaved();

  return (
    <div className="border-b border-outline-variant/70 bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex h-7 items-center justify-between px-5 text-[10px] tracking-[0.22em] text-on-surface-variant lg:px-8">
        <span className="font-medium text-on-surface">
          VOL.&nbsp;{CURRENT_ISSUE.vol}
          <span aria-hidden className="mx-2 opacity-50">
            ·
          </span>
          {CURRENT_ISSUE.season}
        </span>
        <span>
          SAVED&nbsp;
          <span className="font-medium text-on-surface tabular-nums">
            {saved.length}
          </span>
        </span>
      </div>
    </div>
  );
}
