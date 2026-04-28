"use client";

import Image from "next/image";
import Link from "next/link";
import { HeartToggle } from "@/components/ui/HeartToggle";
import type { Product } from "@/lib/product";

/**
 * 시안 상품 상세의 메인 이미지 + 우측 섬네일 스택 영역.
 *
 * 실제로는 네이버 API가 이미지 1장만 주기 때문에, 섬네일은 같은 이미지를
 * 반복 노출(mock). `thumbnails` prop으로 추후 확장.
 */
export function ProductHero({
  product,
  thumbnails,
}: {
  product: Product;
  thumbnails?: string[];
}) {
  const thumbs = thumbnails ?? [
    product.imageUrl,
    product.imageUrl,
    product.imageUrl,
  ];

  return (
    <section className="relative">
      {/* Top controls */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4">
        <Link
          href="/"
          aria-label="뒤로가기"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 backdrop-blur"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <path
              d="M15 5l-7 7 7 7"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <div className="flex flex-col gap-2">
          <HeartToggle product={product} size="md" />
          <button
            type="button"
            aria-label="공유"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 backdrop-blur"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M12 4v12m0-12-4 4m4-4 4 4M5 14v5h14v-5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Main image */}
      <div className="silhouette-bg relative aspect-[4/5] w-full overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 55vw"
          priority
        />

        {/* Page indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="flex gap-1">
            <span className="h-1 w-6 rounded-full bg-on-surface" />
            <span className="h-1 w-1.5 rounded-full bg-on-surface/30" />
            <span className="h-1 w-1.5 rounded-full bg-on-surface/30" />
            <span className="h-1 w-1.5 rounded-full bg-on-surface/30" />
          </div>
        </div>

        {/* Side position marker */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] tracking-[0.22em] text-on-surface-variant">
          P01 &nbsp; 1/{thumbs.length + 1}
        </div>

        {/* Right thumbnail stack */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          {thumbs.slice(0, 4).map((src, i) => (
            <div
              key={i}
              className="silhouette-bg h-10 w-10 overflow-hidden border border-on-surface/10"
            >
              <Image
                src={src}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover opacity-80"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
