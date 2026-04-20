"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { getAffiliateLink } from "@/lib/affiliate";
import { parseProductFromSearchParams } from "@/lib/product";
import { formatKrwAmount } from "@/lib/utils";

function ProductDetailBody() {
  const searchParams = useSearchParams();
  const product = useMemo(
    () => parseProductFromSearchParams(searchParams),
    [searchParams]
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <p className="text-secondary">상품 정보를 찾을 수 없습니다.</p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-primary underline"
        >
          검색으로 돌아가기
        </Link>
      </div>
    );
  }

  const affiliateHref = getAffiliateLink(product.link, product.mallName ?? "");

  return (
    <div className="min-h-[max(884px,100dvh)] bg-surface text-on-surface">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-outline-variant bg-surface/95 px-4 py-3 backdrop-blur-sm">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low transition-opacity active:opacity-70"
          aria-label="검색으로 돌아가기"
        >
          <span className="material-symbols-outlined text-xl text-primary">
            arrow_back
          </span>
        </Link>
        <span className="truncate font-newsreader text-lg italic text-primary">
          상품 상세
        </span>
      </header>

      <main className="mx-auto max-w-lg px-6 pb-32 pt-6">
        <div className="relative aspect-[4/5] w-full overflow-hidden border border-outline-variant bg-surface-container-low">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        <div className="mt-6 space-y-3">
          <p className="text-xs uppercase tracking-wider text-on-surface-variant">
            {product.mall}
            {product.mallName ? ` · ${product.mallName}` : null}
          </p>
          <h1 className="font-newsreader text-2xl leading-snug text-primary">
            {product.name}
          </h1>
          <p className="text-xl font-medium">{formatKrwAmount(product.price)}원</p>
        </div>
      </main>

      <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-outline-variant bg-surface/95 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto max-w-lg space-y-2">
          <a
            href={affiliateHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center bg-primary px-6 py-4 text-sm font-semibold uppercase tracking-wider text-on-primary transition-opacity active:opacity-90"
          >
            제휴 쇼핑몰에서 보기
          </a>
          <p className="text-center text-[11px] text-on-surface-variant">
            외부 제휴 사이트로 이동합니다.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50dvh] items-center justify-center text-sm text-secondary">
          불러오는 중…
        </div>
      }
    >
      <ProductDetailBody />
    </Suspense>
  );
}
