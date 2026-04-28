/**
 * 팔로우(Follow) 브랜드 로컬 스토리지 관리.
 *
 * - 클라이언트 전용(SSR-safe). `typeof window` 가드.
 * - `useSyncExternalStore` 캐싱으로 동일 스냅샷 참조 유지.
 * - 값은 브랜드 slug 배열 + 팔로우 시각.
 */

const KEY = "fm.follow.v1";
const EVENT = "fm-follow-change";

export type FollowedBrand = {
  slug: string;
  followedAt: number;
};

let cachedRaw: string | null = null;
let cachedItems: FollowedBrand[] = [];
const EMPTY_ITEMS: FollowedBrand[] = [];

export function listFollowed(): FollowedBrand[] {
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
    cachedItems = parsed.filter(isFollowedBrand);
    return cachedItems;
  } catch {
    cachedItems = EMPTY_ITEMS;
    return cachedItems;
  }
}

export function isFollowed(slug: string): boolean {
  return listFollowed().some((b) => b.slug === slug);
}

/** 팔로우 토글. 팔로우했으면 true, 해제했으면 false 반환. */
export function toggleFollow(slug: string): boolean {
  const current = listFollowed();
  const existsIdx = current.findIndex((b) => b.slug === slug);
  let next: FollowedBrand[];
  let followed: boolean;
  if (existsIdx >= 0) {
    next = current.filter((_, i) => i !== existsIdx);
    followed = false;
  } else {
    next = [{ slug, followedAt: Date.now() }, ...current];
    followed = true;
  }
  persist(next);
  return followed;
}

export function unfollow(slug: string) {
  const next = listFollowed().filter((b) => b.slug !== slug);
  persist(next);
}

export function clearFollowed() {
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

function persist(next: FollowedBrand[]) {
  if (typeof window === "undefined") return;
  const serialized = JSON.stringify(next);
  window.localStorage.setItem(KEY, serialized);
  cachedRaw = serialized;
  cachedItems = next;
  window.dispatchEvent(new CustomEvent(EVENT));
}

function isFollowedBrand(value: unknown): value is FollowedBrand {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.slug === "string" && typeof v.followedAt === "number";
}
