"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { parseProductFromSearchParams } from "@/lib/product";
import { ProductDetailScreen } from "@/components/product/ProductDetailScreen";

function ProductDetailBody() {
  const searchParams = useSearchParams();
  const product = useMemo(
    () => parseProductFromSearchParams(searchParams),
    [searchParams]
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-8 py-32 text-center">
        <p className="mb-4 font-mono text-[8px] uppercase tracking-[0.14em] text-on-surface-variant">
          Not found
        </p>
        <p className="font-playfair text-2xl text-on-surface">
          We couldn&apos;t find this product.
        </p>
        <Link
          href="/feed"
          className="mt-8 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-on-surface underline-offset-2 hover:underline"
        >
          Back to feed
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <ProductDetailScreen product={product} />
    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50dvh] items-center justify-center">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-on-surface-variant">
            Loading
          </span>
        </div>
      }
    >
      <ProductDetailBody />
    </Suspense>
  );
}
