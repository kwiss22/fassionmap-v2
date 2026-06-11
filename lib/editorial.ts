/**
 * 매거진 이슈(VOL) 기반 에디토리얼 컬렉션 모델.
 *
 * 이슈 데이터는 `data/issues/vol-NNN.json`. 최신 이슈는 서버의
 * `getCurrentIssue()` (`lib/issue-store.ts`) 또는 `/api/issue/current`로 읽는다.
 * `CURRENT_ISSUE`는 클라이언트 폴백용 기본 스냅샷(vol-007).
 */

import { BRANDS } from "./brands";
import defaultIssue from "../data/issues/vol-007.json";

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

/** 클라이언트 폴백 — API 실패 시 vol-007 스냅샷. */
export const CURRENT_ISSUE = defaultIssue as EditorialIssue;

/** 브랜드 슬러그 → 쿼리 문자열 해결. 모르는 슬러그면 slug 자체 반환. */
export function resolveBrandQuery(slug: string): string {
  const b = BRANDS.find((x) => x.slug === slug);
  return b?.query ?? slug;
}
