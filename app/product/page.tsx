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
      <div className="mx-auto max-w-lg px-8 py-32 text-center">
        <p className="eyebrow mb-4">Not found</p>
        <p className="font-newsreader text-2xl italic text-primary">
          상품 정보를 찾을 수 없습니다.
        </p>
        <Link
          href="/"
          className="underline-link mt-8 inline-block text-sm text-on-surface"
          data-active="true"
        >
          검색으로 돌아가기
        </Link>
      </div>
    );
  }

  const affiliateHref = getAffiliateLink(product.link, product.mallName ?? "");

  return (
    <div className="min-h-[max(884px,100dvh)] bg-surface text-on-surface">
      <header className="sticky top-0 z-40 border-b border-outline-variant/70 bg-surface/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-6 px-8">
          <Link
            href="/"
            className="eyebrow flex items-center gap-2 text-on-surface transition-colors hover:text-primary"
            aria-label="검색으로 돌아가기"
          >
            <span aria-hidden="true">←</span> Back
          </Link>
          <Link
            href="/"
            className="font-newsreader text-[22px] italic leading-none tracking-tight text-primary"
          >
            패션맵
          </Link>
          <span className="eyebrow hidden md:inline">Product</span>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1440px] gap-12 px-8 pb-40 pt-12 md:grid-cols-[1.15fr_1fr] md:gap-20 md:pt-20">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container-low">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 55vw"
            priority
          />
        </div>

        <div className="flex flex-col justify-center space-y-8 md:max-w-md md:pt-16">
          <div className="space-y-3">
            <p className="eyebrow">
              {product.mall}
              {product.mallName ? ` · ${product.mallName}` : null}
            </p>
            <h1 className="font-newsreader text-4xl italic leading-tight text-primary md:text-5xl">
              {product.name}
            </h1>
          </div>

          <div className="border-t border-outline-variant/60 pt-6">
            <p className="eyebrow mb-2">Price</p>
            <p className="font-newsreader text-3xl italic tabular-nums text-primary">
              {formatKrwAmount(product.price)}
              <span className="ml-2 text-base not-italic text-on-surface-variant">
                KRW
              </span>
            </p>
          </div>

          <div className="hidden md:block">
            <a
              href={affiliateHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-14 items-center justify-center bg-primary px-10 text-[12px] font-medium uppercase tracking-[0.25em] text-on-primary transition-opacity hover:opacity-90"
            >
              제휴 쇼핑몰에서 보기 →
            </a>
            <p className="mt-3 text-[11px] tracking-wider text-on-surface-variant">
              외부 제휴 사이트로 이동합니다.
            </p>
          </div>
        </div>
      </main>

      {/* Mobile sticky CTA */}
      <footer className="fixed bottom-0 left-0 z-50 w-full border-t border-outline-variant bg-surface/95 px-6 py-4 backdrop-blur-md md:hidden">
        <div className="mx-auto max-w-lg space-y-2">
          <a
            href={affiliateHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center bg-primary px-6 py-4 text-[12px] font-medium uppercase tracking-[0.25em] text-on-primary transition-opacity active:opacity-90"
          >
            제휴 쇼핑몰에서 보기 →
          </a>
          <p className="text-center text-[11px] tracking-wider text-on-surface-variant">
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
        <div className="flex min-h-[50dvh] items-center justify-center">
          <span className="eyebrow">Loading</span>
        </div>
      }
    >
      <ProductDetailBody />
    </Suspense>
  );
}
