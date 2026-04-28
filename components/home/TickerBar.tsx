/**
 * 시안의 "IN THIS WEEK · 무료 배송 · 관세 포함" 무한 마퀴 바.
 *
 * CSS 키프레임으로 -50% translate (원본 트랙 X 2 복제해 이음새 제거).
 */
export function TickerBar({ items }: { items: readonly string[] }) {
  if (!items.length) return null;

  return (
    <div className="overflow-hidden border-y border-outline-variant/70 bg-surface">
      <div className="hide-scrollbar overflow-hidden">
        <div className="ticker-track py-3 text-[11px] tracking-[0.22em] text-on-surface-variant">
          {[...items, ...items].map((text, i) => (
            <span key={i} className="inline-flex items-center">
              <span aria-hidden className="mr-10 opacity-60">
                ○
              </span>
              <span>{text}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
