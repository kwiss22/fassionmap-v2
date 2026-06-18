"use client";

import { cn } from "@/lib/utils";
import type { Product } from "@/lib/product";
import { useSaved } from "@/lib/hooks/use-saved";

type HeartToggleProps = {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
  ariaLabel?: string;
};

const SIZE_PX = { sm: 16, md: 20, lg: 22 } as const;
const CONTAINER = {
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-11 w-11",
} as const;

export function HeartToggle({
  product,
  size = "md",
  className,
  ariaLabel,
}: HeartToggleProps) {
  const { has, toggle } = useSaved();
  const active = has(product.id);
  const px = SIZE_PX[size];

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel ?? (active ? "Remove from saved" : "Save")}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(product);
      }}
      className={cn(
        CONTAINER[size],
        "inline-flex items-center justify-center rounded-full border bg-surface/95 shadow-[0_1px_6px_rgba(0,0,0,0.06)] backdrop-blur transition-all active:scale-95",
        active
          ? "border-on-surface bg-on-surface text-on-primary-container"
          : "border-outline-variant text-on-surface-variant hover:border-on-surface hover:text-on-surface",
        className
      )}
    >
      <svg
        width={px}
        height={px}
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        aria-hidden
      >
        <path
          d="M12 20s-6.5-4-6.5-9.2A3.8 3.8 0 0 1 9.3 7a3.3 3.3 0 0 1 2.7 1.3A3.3 3.3 0 0 1 14.7 7a3.8 3.8 0 0 1 3.8 3.8c0 5.2-6.5 9.2-6.5 9.2Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
