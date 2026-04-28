"use client";

import type { Product } from "@/lib/product";
import { HeartToggle } from "@/components/ui/HeartToggle";
import { formatMallDisplay } from "@/components/product/MallBadge";

export function PurchaseBar({
  product,
  affiliateHref,
}: {
  product: Product;
  affiliateHref: string;
}) {
  const mallDisplay = formatMallDisplay(product.mallName ?? product.mall);
  const label = mallDisplay
    ? `${mallDisplay}에서 구매하기`
    : "브랜드 스토어에서 구매하기";

  return (
    <footer className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-outline-variant bg-surface/95 px-4 py-3 backdrop-blur-md sm:max-w-[720px] lg:max-w-[1200px]">
      <div className="flex items-center gap-3 pb-safe">
        <HeartToggle product={product} size="lg" />
        <a
          href={affiliateHref}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-[12px] font-semibold tracking-[0.18em] text-on-primary transition-opacity active:opacity-90"
        >
          {label}
          <span aria-hidden>↗</span>
        </a>
      </div>
    </footer>
  );
}
