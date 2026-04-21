import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg";

const variantClassMap: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-on-primary hover:bg-primary/90 active:bg-primary/80",
  outline:
    "border border-outline-variant bg-transparent text-on-surface hover:border-primary hover:bg-surface-container-low",
  ghost:
    "bg-transparent text-on-surface hover:bg-surface-container-low",
  link:
    "bg-transparent px-0 text-on-surface hover:text-primary underline-offset-4 hover:underline",
};

const sizeClassMap: Record<ButtonSize, string> = {
  default: "h-10 px-5 text-[13px]",
  sm: "h-8 px-3 text-[11px] uppercase tracking-[0.18em]",
  lg: "h-12 px-7 text-[13px] uppercase tracking-[0.22em]",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
        variantClassMap[variant],
        sizeClassMap[size],
        className
      )}
      {...props}
    />
  );
}
