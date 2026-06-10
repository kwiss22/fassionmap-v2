"use client";

import Image from "next/image";
import Link from "next/link";
import { type Product, productToDetailHref } from "@/lib/product";
import { formatAmount, productDisplayCurrency } from "@/lib/price";
import { cn } from "@/lib/utils";
import { HeartToggle } from "@/components/ui/HeartToggle";
import { MallBadge, formatMallDisplay } from "@/components/product/MallBadge";
import { extractBrand } from "@/lib/brand-extract";
import { isBoostedMall } from "@/lib/mall-policy";

type ProductCardProps = {
  product: Product;
  /** LCP 최적화: 뷰포트 상단 첫 카드만 true */
  priority?: boolean;
  /** 저장 시점 대비 할인율을 표시하고 싶을 때 전달 (0~100). */
  discountPct?: number;
  /** 원가(저장 시점) — 취소선으로 표시 */
  originalPrice?: number;
  /**
   * eyebrow 라벨을 강제 지정 (예: 브랜드 페이지에서 "MAISON ALÉNE"으로 통일).
   * 미지정 시 우선순위:
   *   1) 타이틀에서 추출한 큐레이션 브랜드 (PRADA, HERMÈS …)
   *   2) 부스트 몰의 정규화된 표기 (NET-A-PORTER, FARFETCH …)
   *   3) 표기 안 함 (이름과 가격으로만)
   */
  brandOverride?: string;
  className?: string;
};

export function ProductCard({
  product,
  priority = false,
  discountPct,
  originalPrice,
  brandOverride,
  className,
}: ProductCardProps) {
  const detailHref = productToDetailHref(product);

  // eyebrow: 브랜드 우선 → 부스트 몰 → 없음.
  // "네이버" / 무명 셀러 mallName은 노출하지 않는다 (에디토리얼 톤 손상).
  const detectedBrand = extractBrand(product.name);
  const boostedMallLabel = isBoostedMall(product.mallName)
    ? formatMallDisplay(product.mallName ?? "")
    : "";
  const eyebrow =
    brandOverride ?? detectedBrand ?? boostedMallLabel ?? "";

  // 이미지 위 mall 배지: 부스트 몰일 때만 노출 (편집숍·백화점·글로벌 리테일러).
  // 무명 셀러는 노출 자체가 신뢰도 손해.
  const showMallBadge =
    !!product.mallName && isBoostedMall(product.mallName);

  const currency = productDisplayCurrency(product);
  const priceLabel = formatAmount(product.price, currency);
  const originalLabel =
    typeof originalPrice === "number" && originalPrice > product.price
      ? formatAmount(originalPrice, currency)
      : null;

  return (
    <article className={cn("group relative flex flex-col", className)}>
      <Link
        href={detailHref}
        className="img-hover-zoom silhouette-bg relative block aspect-[4/5] w-full overflow-hidden"
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

        {typeof discountPct === "number" && discountPct > 0 && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-surface/95 px-2 py-1 text-[10px] font-semibold tracking-wide text-accent shadow-sm">
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M12 5v14m0 0-5-5m5 5 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            −{discountPct}%
          </span>
        )}

        <HeartToggle
          product={product}
          size="sm"
          className="absolute right-2 top-2"
        />

        {showMallBadge && product.mallName && (
          <div className="pointer-events-none absolute bottom-2 left-2">
            <MallBadge mall={product.mallName} variant="solid" />
          </div>
        )}
      </Link>

      <div className="mt-4 space-y-1">
        {eyebrow && <p className="eyebrow truncate">{eyebrow}</p>}
        <Link
          href={detailHref}
          title={product.name}
          className="clamp-2 block text-[13px] leading-snug text-on-surface transition-colors group-hover:text-accent"
        >
          {product.name}
        </Link>
        <div className="flex items-baseline gap-2 pt-1 text-[13px] tabular-nums">
          <span className="font-medium text-on-surface">{priceLabel}</span>
          {originalLabel && (
            <span className="text-[11px] text-on-surface-variant line-through">
              {originalLabel}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
