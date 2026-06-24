"use client";

import Link from "next/link";
import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { parseProductFromSearchParams } from "@/lib/product";
import { AffiliateWebviewScreen } from "@/components/checkout/AffiliateWebviewScreen";

function WebviewBody() {
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
          We couldn&apos;t open this checkout view.
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

  return <AffiliateWebviewScreen product={product} />;
}

export default function CheckoutWebviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50dvh] items-center justify-center bg-[#0a0a0a]">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#555555]">
            Loading
          </span>
        </div>
      }
    >
      <WebviewBody />
    </Suspense>
  );
}
