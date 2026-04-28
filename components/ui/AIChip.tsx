import { cn } from "@/lib/utils";

export function AIChip({
  children = "AI",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return <span className={cn("ai-chip", className)}>{children}</span>;
}
