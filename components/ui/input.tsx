import * as React from "react";
import { cn } from "@/lib/utils";

type InputVariant = "bordered" | "underline";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
}

const variantClassMap: Record<InputVariant, string> = {
  bordered:
    "h-11 border border-outline-variant bg-transparent px-4 text-sm focus-visible:border-primary focus-visible:outline-none",
  underline:
    "h-12 border-0 border-b border-outline bg-transparent px-0 text-base tracking-tight focus-visible:border-primary focus-visible:outline-none",
};

export function Input({
  className,
  type = "text",
  variant = "bordered",
  ...props
}: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "w-full text-on-surface placeholder:text-on-surface-variant/60 transition-colors",
        variantClassMap[variant],
        className
      )}
      {...props}
    />
  );
}
