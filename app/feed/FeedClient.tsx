"use client";

import { useFollow } from "@/lib/hooks/use-follow";
import { FollowedFeed } from "@/components/feed/FollowedFeed";
import { FollowingStrip } from "@/components/feed/FollowingStrip";
import { BrandPicker } from "@/components/feed/BrandPicker";

/**
 * 피드 클라이언트 분기:
 * - 팔로우 없음 → 브랜드 피커(에디토리얼 헤더 포함)
 * - 팔로우 있음 → 팔로우 가로 스트립 + 상품 통합 피드
 */
export function FeedClient() {
  const { items } = useFollow();
  const isEmpty = items.length === 0;

  if (isEmpty) {
    return <BrandPicker emphasizeHeader />;
  }

  return (
    <>
      <section className="px-5 pt-6">
        <p className="eyebrow">FOLLOWING</p>
        <h2 className="editorial-display mt-2 text-[30px] italic">
          Your feed.
        </h2>
        <p className="mt-2 text-[13px] text-on-surface-variant">
          팔로우한 {items.length}개 브랜드의 신상·셀렉션을 이어 봅니다.
        </p>
      </section>
      <div className="mt-4">
        <FollowingStrip />
      </div>
      <FollowedFeed />
    </>
  );
}
