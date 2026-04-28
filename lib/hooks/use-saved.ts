"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  listSaved,
  subscribe,
  toggleSaved,
  type SavedItem,
} from "@/lib/saved-storage";
import type { Product } from "@/lib/product";

const EMPTY: SavedItem[] = [];

function getSnapshot(): SavedItem[] {
  return listSaved();
}

function getServerSnapshot(): SavedItem[] {
  return EMPTY;
}

export function useSaved() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = useCallback((p: Product) => toggleSaved(p), []);
  const has = useCallback(
    (id: string) => items.some((it) => it.id === id),
    [items]
  );

  return { items, toggle, has };
}
