import Image from "next/image";
import Link from "next/link";
import { type Product, productToDetailHref } from "@/lib/product";
import { formatKrwAmount } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
  /** LCP 최적화: 뷰포트 상단에 들어올 첫 카드에만 true로 넘겨주세요. */
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const detailHref = productToDetailHref(product);

  return (
    <article className="group flex flex-col">
      <Link
        href={detailHref}
        className="img-hover-zoom relative block aspect-[4/5] w-full overflow-hidden bg-surface-container-low"
        aria-label={product.name}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
        />
      </Link>

      <div className="mt-4 space-y-1.5">
        <p className="eyebrow truncate">{product.mall}</p>
        <Link
          href={detailHref}
          title={product.name}
          className="clamp-2 block text-[13px] leading-snug text-on-surface transition-colors group-hover:text-secondary"
        >
          {product.name}
        </Link>
        <p className="pt-1 text-[13px] tracking-wide tabular-nums text-primary">
          {formatKrwAmount(product.price)}
          <span className="ml-1 text-on-surface-variant">KRW</span>
        </p>
      </div>
    </article>
  );
}
