"use client";

import { cn } from "@/lib/utils";
import { useFollow } from "@/lib/hooks/use-follow";

type FollowButtonProps = {
  slug: string;
  /** 작은 pill(=리스트/카드 내부) vs 일반 버튼 */
  variant?: "pill" | "solid";
  className?: string;
};

/**
 * 브랜드 팔로우 토글 버튼. 시안의 "FOLLOW / FOLLOWING" 스타일.
 * - 팔로우 중: 검정 배경 + 흰 글씨 "FOLLOWING"
 * - 팔로우 안 함: 투명 + 검정 보더 "FOLLOW"
 */
export function FollowButton({
  slug,
  variant = "pill",
  className,
}: FollowButtonProps) {
  const { has, toggle } = useFollow();
  const active = has(slug);

  const base =
    "inline-flex items-center justify-center rounded-full border tracking-[0.22em] uppercase transition-colors";
  const sizes =
    variant === "pill" ? "px-3 py-1 text-[10px]" : "px-4 py-2 text-[11px]";
  const styles = active
    ? "border-primary bg-primary text-on-primary"
    : "border-outline text-on-surface hover:bg-surface-container";

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? "팔로우 해제" : "팔로우"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(slug);
      }}
      className={cn(base, sizes, styles, className)}
    >
      {active ? "FOLLOWING" : "+ FOLLOW"}
    </button>
  );
}
