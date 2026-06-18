"use client";

import { useCurrentIssue } from "@/lib/hooks/use-current-issue";
import { useSaved } from "@/lib/hooks/use-saved";
import { cn } from "@/lib/utils";

export function StatusStrip({ dark = false }: { dark?: boolean }) {
  const { items: saved } = useSaved();
  const { issue } = useCurrentIssue();

  return (
    <div
      className={cn(
        "border-b backdrop-blur-md",
        dark
          ? "border-[rgba(57,255,122,0.08)] bg-[#060a08]/95"
          : "border-outline-variant/70 bg-surface/95"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-7 items-center justify-between px-5 font-mono text-[9px] tracking-[0.18em] lg:px-8",
          dark ? "text-[#2a4030]" : "text-on-surface-variant"
        )}
      >
        <span className={cn("font-medium", dark ? "text-[var(--color-neon)]" : "text-on-surface")}>
          VOL.&nbsp;{issue.vol}
          <span aria-hidden className="mx-2 opacity-50">
            ·
          </span>
          {issue.season}
        </span>
        <span>
          SAVED&nbsp;
          <span
            className={cn(
              "font-medium tabular-nums",
              dark ? "text-[#e8f0eb]" : "text-on-surface"
            )}
          >
            {saved.length}
          </span>
        </span>
      </div>
    </div>
  );
}
