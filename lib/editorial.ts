/**
 * 매거진 이슈(VOL) 기반 에디토리얼 컬렉션 모델.
 *
 * 홈 피드는 하나의 `EditorialIssue`를 렌더링한다.
 * 각 이슈는 여러 `EditorialSection`을 가지며, 섹션은 상품을 어떻게 채울지
 * (`source`)를 스스로 알고 있다. 데이터 로딩은 `useHomeFeed` 훅이 담당.
 *
 * 이번 라운드에서는 `CURRENT_ISSUE` 1개를 하드코딩. 이후 CMS 또는 JSON
 * 분리로 자연스럽게 확장 가능한 구조.
 */

import { BRANDS } from "./brands";

export type EditorialSectionSource =
  | { type: "brand"; brandSlug: string; category?: string }
  | { type: "theme"; query: string; size?: number }
  | { type: "saved-ai" };

export type EditorialSection = {
  id: string;
  eyebrow: string;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  viewAllHref?: string;
  source: EditorialSectionSource;
  /** 섹션당 기본 노출 카드 수 */
  size?: number;
};

export type EditorialIssue = {
  vol: string;
  season: string;
  title: string;
  titleHighlight?: string;
  dek: string;
  date: string;
  city: string;
  coverLabel: string;
  /** 풀-블리드 커버 이미지 URL (next/image에서 처리). */
  coverImage: string;
  /** 커버 이미지 alt — 짧은 한 줄, SEO/접근성용. */
  coverAlt: string;
  /**
   * 이미지 안에서 어디를 frame center로 둘지.
   * 인물의 눈/포인트가 위쪽에 있는 사진은 "center 30%" 같은 식으로 art-direct 가능.
   * 미지정 시 "center" (50% 50%).
   */
  coverFocal?: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  tickerItems: string[];
  sections: EditorialSection[];
};

export const CURRENT_ISSUE: EditorialIssue = {
  vol: "07",
  season: "SS26",
  title: "Quiet luxury, loud taste.",
  titleHighlight: "luxury",
  dek: "52 pieces curated by editors and AI — from Farfetch to Net-a-Porter and beyond.",
  date: "04 · 24 · 26",
  city: "SEOUL",
  coverLabel: "COVER 01",
  // Unsplash editorial — 따뜻한 베이지/카멜 톤 컷, 본문 ivory 팔레트와 어울림.
  // (q=85, w=1800까지 — Hi-DPI 대응. next/image가 사이즈별 변환 처리.)
  coverImage:
    "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=85&w=1800",
  coverAlt:
    "Cashmere coat editorial — Quiet luxury, SS26 collection cover.",
  coverFocal: "center 35%",
  primaryCtaLabel: "VIEW COLLECTION",
  primaryCtaHref: "/feed",
  secondaryCtaLabel: "LOOKBOOK",
  secondaryCtaHref: "/saved?tab=looks",
  tickerItems: [
    "IN THIS WEEK",
    "FREE SHIPPING",
    "DUTIES INCLUDED",
    "SS26 NEW ARRIVAL",
    "EDITOR'S PICK",
  ],
  sections: [
    {
      id: "ai-curated",
      eyebrow: "CURATED FOR YOU",
      title: "Nine picks for you today",
      subtitle: "Based on recent views and your saved list",
      source: { type: "saved-ai" },
      size: 9,
      viewAllHref: "/saved",
    },
    {
      id: "theme-cashmere",
      eyebrow: "EDITOR'S EDIT · 01",
      title: "The cashmere edit",
      titleHighlight: "cashmere",
      subtitle: "Last cashmere coats before winter fades",
      source: { type: "theme", query: "cashmere coat women", size: 6 },
      size: 6,
    },
    {
      id: "brand-hermes",
      eyebrow: "MAISON SPOTLIGHT",
      title: "Hermès, again.",
      titleHighlight: "Hermès",
      subtitle: "The timeless reference — Hermès this season",
      source: { type: "brand", brandSlug: "hermes" },
      size: 6,
    },
    {
      id: "theme-knit",
      eyebrow: "EDITOR'S EDIT · 02",
      title: "Soft power knits",
      titleHighlight: "knits",
      subtitle: "Soft, but impossible to ignore",
      source: { type: "theme", query: "women knit sweater", size: 6 },
      size: 6,
    },
  ],
};

/** 브랜드 슬러그 → 쿼리 문자열 해결. 모르는 슬러그면 slug 자체 반환. */
export function resolveBrandQuery(slug: string): string {
  const b = BRANDS.find((x) => x.slug === slug);
  return b?.query ?? slug;
}
