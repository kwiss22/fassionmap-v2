"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { getAffiliateLink } from "@/lib/affiliate";
import { parseProductFromSearchParams } from "@/lib/product";
import { formatKrwAmount } from "@/lib/utils";
import { ProductHero } from "@/components/product/ProductHero";
import { PurchaseBar } from "@/components/product/PurchaseBar";
import { MallBadge } from "@/components/product/MallBadge";
import { Pill } from "@/components/ui/Pill";

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
        <p className="editorial-display text-2xl">
          상품 정보를 찾을 수 없습니다.
        </p>
        <Link
          href="/"
          className="underline-link mt-8 inline-block text-sm text-on-surface"
          data-active="true"
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  const affiliateHref = getAffiliateLink(product.link, product.mallName ?? "");
  const brandTop = deriveBrandLine(product.name);
  const productLine = stripBrandPrefix(product.name, brandTop);

  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <ProductHero product={product} />

      <section className="px-5 pb-40 pt-6">
        <div className="flex flex-wrap items-center gap-2">
          {product.mallName && (
            <MallBadge mall={product.mallName} variant="outline" />
          )}
          <Pill variant="solid">JUST IN</Pill>
          <span className="ml-auto text-[10px] tracking-[0.22em] text-on-surface-variant">
            P01
          </span>
        </div>

        {brandTop && (
          <p className="mt-4 text-[12px] font-semibold tracking-[0.18em] text-on-surface">
            {brandTop.toUpperCase()}
          </p>
        )}

        <h1 className="editorial-display mt-1 text-[26px] leading-tight">
          {productLine}
        </h1>

        <div className="mt-5 flex items-baseline gap-3 tabular-nums">
          <span className="text-[22px] font-semibold">
            ₩{formatKrwAmount(product.price)}
          </span>
          {/* 원가·할인율은 실데이터가 없으므로 이번 라운드 비노출 */}
        </div>

        <section className="mt-10 space-y-3 border-t border-outline-variant/70 pt-6 text-[13px] leading-relaxed text-on-surface-variant">
          <p>
            선택한 상품은 {product.mall}에서 운영 중인 리테일 정보를 기반으로
            표시됩니다. 구매는 {product.mallName ?? product.mall}의 공식
            스토어로 연결되며, 가격·재고는 이동 후 페이지를 기준으로 합니다.
          </p>
          <p>무료 배송 · 관세 포함가 기준은 각 몰 정책을 따릅니다.</p>
        </section>
      </section>

      <PurchaseBar product={product} affiliateHref={affiliateHref} />
    </main>
  );
}

/** 상품명에서 선두 영문 브랜드 추정 (예: "MAISON ALÉNE Cashmere..." → "Maison Aléne"). */
function deriveBrandLine(name: string): string | undefined {
  const match = name.match(/^([A-Z][A-Z\u00C0-\u00FF&'-]*(?:\s+[A-Z][A-Z\u00C0-\u00FF&'-]*){0,3})\s/);
  if (match) {
    return match[1]
      .toLowerCase()
      .replace(/(^|\s)(\S)/g, (_, p1, p2: string) => p1 + p2.toUpperCase());
  }
  return undefined;
}

function stripBrandPrefix(name: string, brand?: string): string {
  if (!brand) return name;
  const upper = brand.toUpperCase();
  if (name.toUpperCase().startsWith(upper)) {
    return name.slice(upper.length).trim();
  }
  return name;
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
