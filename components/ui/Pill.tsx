import { cn } from "@/lib/utils";

type PillProps = {
  children: React.ReactNode;
  variant?: "outline" | "solid";
  className?: string;
};

export function Pill({ children, variant = "outline", className }: PillProps) {
  return (
    <span
      className={cn(
        "pill-tag",
        variant === "solid" && "pill-tag--solid",
        className
      )}
    >
      {children}
    </span>
  );
}
