import type { Product } from "@/lib/product";
import { fetchAliexpressProductsPage } from "@/lib/aliexpress-api";

/** 예전 네이버 쇼핑 API 제약이었던 상수. 클라이언트 페이지네이션 상한으로 계속 재사용. */
export const NAVER_SHOP_DISPLAY_MAX = 100;
export const NAVER_SHOP_START_MAX = 1000;

/** 정렬 기준 — 네이버 쇼핑 API 시절 `sort` 값을 그대로 유지 (AliExpress 쪽에서 매핑). */
export type SortKey = "sim" | "date" | "asc" | "dsc";

export const SORT_KEYS: SortKey[] = ["sim", "date", "asc", "dsc"];

export function parseSortKey(value: string | null | undefined): SortKey {
  if (value && (SORT_KEYS as string[]).includes(value)) {
    return value as SortKey;
  }
  return "sim";
}

export type SearchOptions = {
  /** 1-based 시작 인덱스 (기본 1) */
  start?: number;
  /** 한 페이지 결과 수 (1~100, 기본 40) */
  display?: number;
  /** 정렬 (기본 sim) */
  sort?: SortKey;
};

export type SearchPage = {
  items: Product[];
  total: number;
  start: number;
  display: number;
  /** 다음 페이지 요청 가능 여부 */
  hasMore: boolean;
  /** 다음 페이지의 start 인덱스 (hasMore일 때만 유효) */
  nextStart: number;
};

function clampDisplay(display: number | undefined): number {
  if (!display || display < 1) return 40;
  return Math.min(display, NAVER_SHOP_DISPLAY_MAX);
}

function clampStart(start: number | undefined): number {
  if (!start || start < 1) return 1;
  return Math.min(start, NAVER_SHOP_START_MAX);
}

/**
 * 네이버 쇼핑 검색 오픈API가 2026-07-31부로 종료됐다 (errorCode SE05,
 * 개발자센터 "API 제휴 신청"에 종료 공지 게시됨 — 신규 앱에서도 "검색" 사용 API
 * 선택지 자체가 빠짐). 기존 호출부(라우트 `/api/naver-products`, 훅, 서버 컴포넌트)의
 * `start`/`display` 기반 계약은 그대로 둔 채, 내부적으로만
 * AliExpress Affiliate API(`lib/aliexpress-api.ts`)로 위임한다.
 *
 * 반환되는 `Product.source`는 AliExpress 쪽 매핑이 그대로 `"aliexpress"`로 채우므로
 * `lib/price.ts`의 통화 표기(₩ vs $)도 자동으로 맞는다.
 */
export async function fetchNaverProductsPage(
  query: string,
  options: SearchOptions = {}
): Promise<SearchPage> {
  const start = clampStart(options.start);
  const display = clampDisplay(options.display);

  const page = await fetchAliexpressProductsPage(query, {
    pageNo: Math.max(1, Math.ceil(start / display)),
    pageSize: display,
    sort: options.sort ?? "sim",
  });

  return {
    items: page.items,
    total: page.total,
    start,
    display,
    hasMore: page.hasMore,
    nextStart: page.hasMore ? start + display : start,
  };
}
