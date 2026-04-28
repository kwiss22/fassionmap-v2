/**
 * 저장(Saved) 상품 로컬 스토리지 관리.
 *
 * - 클라이언트 전용(SSR-safe): 브라우저 접근은 모두 `typeof window` 가드.
 * - 외부 구독은 `subscribe`로 등록하고 `useSyncExternalStore`에서 활용.
 * - 스토리지 버전은 키 접미사(`v1`)로 관리. 이후 마이그레이션 시 새 키로 대체.
 */

import type { Product } from "./product";

const KEY = "fm.saved.v1";
const EVENT = "fm-saved-change";

export type SavedItem = Product & {
  savedAt: number;
  /** 저장 시점 가격 — 가격 인하 계산 기준 */
  savedPrice: number;
};

/**
 * `useSyncExternalStore` 캐싱: 마지막으로 파싱한 JSON 문자열과 결과를 보관.
 *
 * 이 캐시가 없으면 매 호출마다 새 배열이 반환되어 `useSyncExternalStore`가
 * 무한 루프를 일으킨다. 문자열이 동일하면 동일 참조를 재사용.
 */
let cachedRaw: string | null = null;
let cachedItems: SavedItem[] = [];

export function listSaved(): SavedItem[] {
  if (typeof window === "undefined") return cachedItems;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedItems;
    cachedRaw = raw;
    if (!raw) {
      cachedItems = EMPTY_ITEMS;
      return cachedItems;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cachedItems = EMPTY_ITEMS;
      return cachedItems;
    }
    cachedItems = parsed.filter(isSavedItem);
    return cachedItems;
  } catch {
    cachedItems = EMPTY_ITEMS;
    return cachedItems;
  }
}

const EMPTY_ITEMS: SavedItem[] = [];

export function isSaved(id: string): boolean {
  return listSaved().some((item) => item.id === id);
}

/** 저장 토글. 저장했으면 true, 해제했으면 false 반환. */
export function toggleSaved(product: Product): boolean {
  const current = listSaved();
  const existsIdx = current.findIndex((item) => item.id === product.id);
  let next: SavedItem[];
  let saved: boolean;
  if (existsIdx >= 0) {
    next = current.filter((_, i) => i !== existsIdx);
    saved = false;
  } else {
    next = [
      {
        ...product,
        savedAt: Date.now(),
        savedPrice: product.price,
      },
      ...current,
    ];
    saved = true;
  }
  persist(next);
  return saved;
}

export function removeSaved(id: string) {
  const next = listSaved().filter((item) => item.id !== id);
  persist(next);
}

export function clearSaved() {
  persist([]);
}

export function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(EVENT, handler);
  };
}

function persist(next: SavedItem[]) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(next);
  window.localStorage.setItem(KEY, serialized);
  // 즉시 캐시 갱신해 구독자가 새 참조를 받도록 함
  cachedRaw = serialized;
  cachedItems = next;
  window.dispatchEvent(new CustomEvent(EVENT));
}

function isSavedItem(value: unknown): value is SavedItem {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.name === "string" &&
    typeof v.imageUrl === "string" &&
    typeof v.link === "string" &&
    typeof v.savedAt === "number"
  );
}
