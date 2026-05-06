import { cn } from "@/lib/utils";

function SparklesGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2l1.2 4.2 4.4.4-3.4 2.6 1.2 4.4-3.4-2.4-3.4 2.4 1.2-4.4-3.4-2.6 4.4-.4L12 2z" />
      <path
        opacity="0.85"
        d="M20 3l.6 1.8 1.8.2-1.4 1 .6 1.8-1.4-1-1.4 1 .6-1.8-1.4-1 1.8-.2L20 3z"
      />
    </svg>
  );
}

export function AIChip({
  children = "AI",
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("ai-chip", className)}>
      <SparklesGlyph />
      {children}
    </span>
  );
}
