import Image from "next/image";
import Link from "next/link";
import type { StylingLook } from "@/lib/styling-looks";
import { productToDetailHref } from "@/lib/product";

type LookCardProps = {
  look: StylingLook;
  /** 모바일에서 슬롯 수 제한 (첫 화면 단순화) */
  compact?: boolean;
};

export function LookCard({ look, compact = false }: LookCardProps) {
  const pieces = compact ? look.pieces.slice(0, 3) : look.pieces;
  const firstLink = look.pieces.find((p) => p.product)?.product;

  return (
    <article className="flex flex-col border border-outline-variant bg-surface-bright/50">
      <div className="border-b border-outline-variant/70 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            {look.context && (
              <p className="text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">
                {look.context}
              </p>
            )}
            <h3 className="mt-0.5 text-[15px] font-medium tracking-tight text-on-surface">
              {look.title}
            </h3>
          </div>
        </div>
        <p className="mt-2 text-[12px] leading-relaxed text-on-surface-variant">
          {look.reason}
        </p>
      </div>

      <div
        className={
          "grid gap-px bg-outline-variant/40 " +
          (pieces.length <= 3 ? "grid-cols-3" : "grid-cols-2 sm:grid-cols-4")
        }
      >
        {pieces.map((piece) => (
          <LookPieceCell key={piece.role} label={piece.label} product={piece.product} />
        ))}
      </div>

      {firstLink && (
        <Link
          href={productToDetailHref(firstLink)}
          className="border-t border-outline-variant/70 px-4 py-3 text-center text-[11px] font-medium tracking-[0.2em] text-on-surface uppercase transition-colors hover:bg-surface-container"
        >
          룩 상세 보기 →
        </Link>
      )}
    </article>
  );
}

function LookPieceCell({
  label,
  product,
}: {
  label: string;
  product: StylingLook["pieces"][0]["product"];
}) {
  const inner = (
    <div className="relative flex aspect-[3/4] flex-col bg-surface">
      {product?.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="120px"
          className="object-cover"
        />
      ) : (
        <div className="silhouette-bg flex flex-1 items-center justify-center text-[9px] tracking-[0.16em] text-on-surface-variant uppercase">
          —
        </div>
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-1.5 py-1.5 text-[9px] tracking-[0.14em] text-white uppercase">
        {label}
      </span>
    </div>
  );

  if (product) {
    return (
      <Link href={productToDetailHref(product)} className="block min-w-0">
        {inner}
      </Link>
    );
  }

  return inner;
}
