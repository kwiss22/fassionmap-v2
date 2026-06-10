"use client";

import Link from "next/link";
import { useFollow } from "@/lib/hooks/use-follow";
import { getBrandBySlug } from "@/lib/brands";

/**
 * 피드 상단에 팔로우한 브랜드를 가로 칩 리스트로 보여준다.
 * 브랜드 이름을 탭하면 해당 브랜드 검색으로 이동.
 * 맨 오른쪽 "+" 칩으로 /feed/discover 이동.
 */
export function FollowingStrip() {
  const { items } = useFollow();

  const brands = items
    .map((it) => getBrandBySlug(it.slug))
    .filter((b): b is NonNullable<typeof b> => !!b);

  return (
    <div className="border-b border-outline-variant/60">
      <div className="hide-scrollbar flex items-center gap-2 overflow-x-auto px-5 py-4">
        {brands.length === 0 ? (
          <p className="text-[12px] text-on-surface-variant">
            No brands followed yet.
          </p>
        ) : (
          brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/search?q=${encodeURIComponent(brand.query)}`}
              className="pill-tag shrink-0 border-outline text-on-surface hover:bg-surface-container"
            >
              {brand.displayEn}
            </Link>
          ))
        )}
        <Link
          href="/brands"
          className="pill-tag shrink-0 border-primary bg-primary text-on-primary"
        >
          + DISCOVER
        </Link>
      </div>
    </div>
  );
}
