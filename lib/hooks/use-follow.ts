"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  listFollowed,
  subscribe,
  toggleFollow,
  type FollowedBrand,
} from "@/lib/follow-storage";

const EMPTY: FollowedBrand[] = [];

function getSnapshot(): FollowedBrand[] {
  return listFollowed();
}

function getServerSnapshot(): FollowedBrand[] {
  return EMPTY;
}

export function useFollow() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((slug: string) => toggleFollow(slug), []);
  const has = useCallback(
    (slug: string) => items.some((b) => b.slug === slug),
    [items]
  );

  return { items, toggle, has };
}
