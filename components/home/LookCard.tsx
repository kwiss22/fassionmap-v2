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
  const heroProduct =
    look.pieces.find((p) => p.product?.imageUrl)?.product ??
    look.pieces.find((p) => p.product)?.product;

  return (
    <article className="flex flex-col">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
        {heroProduct?.imageUrl ? (
          <Image
            src={heroProduct.imageUrl}
            alt={heroProduct.name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="silhouette-bg absolute inset-0" aria-hidden />
        )}
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {look.context && (
          <p className="eyebrow text-on-surface-variant">{look.context}</p>
        )}
        <p className="editorial-display text-[18px] leading-snug text-on-surface sm:text-[20px]">
          {look.reason}
        </p>
        <h3 className="text-[14px] font-medium tracking-[0.06em] text-on-surface-variant uppercase">
          {look.title}
        </h3>
      </div>

      {pieces.length > 0 && (
        <ul className="mt-5 flex gap-3 overflow-x-auto pb-1">
          {pieces.map((piece) => (
            <li key={piece.role} className="shrink-0">
              <LookThumb
                product={piece.product}
                label={piece.label}
                why={look.pieceWhy?.[piece.role]}
              />
            </li>
          ))}
        </ul>
      )}

      {firstLink && (
        <Link
          href={productToDetailHref(firstLink)}
          className="underline-link mt-5 inline-block w-fit text-[11px] tracking-[0.2em] text-on-surface uppercase"
        >
          View look →
        </Link>
      )}
    </article>
  );
}

function LookThumb({
  product,
  label,
  why,
}: {
  product: StylingLook["pieces"][0]["product"];
  label: string;
  why?: string;
}) {
  const inner = (
    <div className="relative h-14 w-11 overflow-hidden bg-surface sm:h-[3.5rem] sm:w-14">
      {product?.imageUrl ? (
        <Image
          src={product.imageUrl}
          alt={product.name || label}
          fill
          sizes="56px"
          className="object-cover"
        />
      ) : (
        <div className="silhouette-bg absolute inset-0" aria-hidden />
      )}
    </div>
  );

  const thumb = product ? (
    <Link
      href={productToDetailHref(product)}
      className="block"
      title={label}
      aria-label={label}
    >
      {inner}
    </Link>
  ) : (
    inner
  );

  return (
    <div className="flex w-24 flex-col gap-1.5 sm:w-28">
      {thumb}
      {why ? (
        <p className="text-[11px] leading-snug text-on-surface-variant">
          <span className="font-medium text-[var(--color-ai)]">Why</span> {why}
        </p>
      ) : null}
    </div>
  );
}
