import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { type Product, productToDetailHref } from "@/lib/product";
import { formatKrwAmount } from "@/lib/utils";

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const detailHref = productToDetailHref(product);

  return (
    <article className="overflow-hidden border border-outline-variant bg-surface">
      <div className="relative aspect-[4/5] w-full">
        <Badge className="absolute left-2 top-2 z-10 w-fit bg-black/70 text-white">
          {product.mall}
        </Badge>
        <Link href={detailHref} className="block h-full w-full">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 50vw, 33vw"
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
