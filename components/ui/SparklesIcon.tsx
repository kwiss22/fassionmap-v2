/** AI 검색·강조용 — 낮은 키에도 읽히는 별/스파클 실루엣 */
export function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2.2l1.4 4.3h4.5l-3.6 2.6 1.4 4.4-3.7-2.7-3.7 2.7 1.4-4.4-3.6-2.6h4.5L12 2.2z" />
      <path
        opacity="0.9"
        d="M20 2.5l.5 1.4h1.5l-1.2.9.4 1.4-1.2-.9-1.2.9.4-1.4-1.2-.9h1.5l.4-1.4z"
      />
    </svg>
  );
}
