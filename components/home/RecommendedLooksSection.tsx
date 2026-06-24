"use client";

import Image from "next/image";
import Link from "next/link";
import { LookCard } from "@/components/home/LookCard";
import { AIChip } from "@/components/ui/AIChip";
import { useNaverProducts } from "@/lib/hooks/use-naver-products";
import { useRecommendedLooks } from "@/lib/hooks/use-recommended-looks";
import { HOME_LOOK_DEFS } from "@/lib/styling-looks";

const PREVIEW_QUERIES = [
  "여성 트렌치코트",
  "여성 니트",
  "캐시미어 니트",
] as const;

/**
 * 홈 AI 룩 — 네이버 API로 슬롯별 상품 이미지를 채운 룩 카드.
 */
export function RecommendedLooksSection() {
  const { looks, loading } = useRecommendedLooks(4);
  const { items: previewItems } = useNaverProducts(PREVIEW_QUERIES, {
    take: 3,
    display: 24,
  });
  const visibleLooks = looks.slice(0, 3);
  const previewDefs = HOME_LOOK_DEFS.slice(0, 3);
  const showPreviews =
    loading &&
    visibleLooks.every(
      (look) => !look.pieces.some((p) => p.product?.imageUrl)
    ) &&
    previewItems.length > 0;

  return (
    <section className="px-5 py-16 lg:px-10 lg:py-24">
      <div className="max-w-2xl">
        <AIChip>AI picks</AIChip>
        <p className="editorial-display mt-5 text-[30px] leading-[1.1] text-on-surface sm:text-[36px]">
          Four looks, four reasons.
        </p>
        <p className="mt-4 text-[14px] leading-relaxed text-on-surface-variant">
          Each outfit comes with an AI summary and a why for every key
          piece — read first, shop second.
        </p>
      </div>

      {showPreviews ? (
        <div className="mt-12 flex flex-col gap-14 lg:mt-16 lg:gap-20">
          {previewItems.map((product, i) => {
            const def = previewDefs[i];
            return (
              <article key={product.id} className="flex flex-col">
                <div className="relative aspect-[4/5] w-full max-w-xl overflow-hidden">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 640px"
                    className="object-cover"
                    priority={i === 0}
                  />
                </div>
                <div className="mt-5 flex max-w-xl flex-col gap-2">
                  {def?.context ? (
                    <p className="eyebrow text-on-surface-variant">
                      {def.context}
                    </p>
                  ) : null}
                  <p className="editorial-display text-[18px] leading-snug text-on-surface sm:text-[20px]">
                    {def?.reason ?? product.name}
                  </p>
                  <h3 className="text-[14px] font-medium tracking-[0.06em] text-on-surface-variant uppercase">
                    {def?.title ?? "Loading look"}
                  </h3>
                </div>
              </article>
            );
          })}
        </div>
      ) : loading ? (
        <div className="mt-12 flex flex-col gap-14">
          {[0, 1].map((i) => (
            <div
              key={i}
              className="silhouette-bg aspect-[4/5] w-full max-w-xl animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="mt-12 flex flex-col gap-14 lg:mt-16 lg:gap-20">
          {visibleLooks.map((look) => (
            <LookCard key={look.id} look={look} />
          ))}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between gap-4 border-t border-outline-variant/40 pt-6">
        <p className="text-[11px] tracking-[0.18em] text-on-surface-variant uppercase">
          More looks on Feed
        </p>
        <Link href="/feed" className="underline-link text-[11px] tracking-[0.2em] uppercase">
          Feed →
        </Link>
      </div>
    </section>
  );
}
