import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
    <article className="overflow-hidden border border-outline-variant bg-surface">
      <div className="relative aspect-[4/5] w-full">
        <Badge className="absolute left-2 top-2 z-10 w-fit bg-black/70 text-white">
          {product.mall}
        </Badge>
        {/* Link가 Image(fill)의 직계 부모가 되므로 position:relative 필수 */}
        <Link href={detailHref} className="relative block h-full w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 33vw"
            priority={priority}
          />
        </Link>
      </div>

      <div className="space-y-2 p-4">
        <Link
          href={detailHref}
          className="block truncate text-base font-medium text-on-surface hover:underline"
          title={product.name}
        >
          {product.name}
        </Link>
        <p className="text-sm text-secondary">
          {formatKrwAmount(product.price)}원
        </p>
      </div>
    </article>
  );
}
