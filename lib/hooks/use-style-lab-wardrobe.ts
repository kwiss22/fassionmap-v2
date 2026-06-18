"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/product";
import {
  LAB_CATEGORIES,
  LAB_CATEGORY_QUERIES,
  productToLabItem,
  type LabCategory,
  type LabWardrobeItem,
} from "@/lib/style-lab";

type WardrobeState = {
  items: LabWardrobeItem[];
  loading: boolean;
  error: string | null;
};

async function fetchCategoryProducts(
  category: LabCategory
): Promise<LabWardrobeItem[]> {
  const query = LAB_CATEGORY_QUERIES[category];
  const url = `/api/naver-products?query=${encodeURIComponent(query)}&start=1&display=12&sort=sim`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const json = (await res.json()) as { items?: Product[] };
  return (json.items ?? []).slice(0, 9).map((p) => productToLabItem(p, category));
}

export function useStyleLabWardrobe() {
  const [state, setState] = useState<WardrobeState>({
    items: [],
    loading: true,
    error: null,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const batches = await Promise.all(
        LAB_CATEGORIES.map((cat) => fetchCategoryProducts(cat))
      );
      setState({
        items: batches.flat(),
        loading: false,
        error: null,
      });
    } catch {
      setState({
        items: [],
        loading: false,
        error: "Could not load wardrobe items.",
      });
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byCategory = useCallback(
    (category: LabCategory) =>
      state.items.filter((item) => item.category === category),
    [state.items]
  );

  return { ...state, reload: load, byCategory };
}
