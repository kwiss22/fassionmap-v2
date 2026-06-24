"use client";

import { useCallback, useEffect, useState } from "react";
import type { StylingLook } from "@/lib/styling-looks";
import {
  HOME_LOOK_DEFS,
  lookDefToEmptyLook,
} from "@/lib/styling-looks";
import { looksHaveProducts } from "@/lib/feed-looks";

type State = {
  looks: StylingLook[];
  loading: boolean;
  error?: string;
};

/**
 * Feed 룩 — `/api/feed-looks` 단일 호출 (서버에서 네이ver API + dedupe).
 */
export function useRecommendedLooks(
  maxLooks = 4,
  initialLooks?: StylingLook[]
) {
  const seeded = initialLooks && looksHaveProducts(initialLooks);

  const [state, setState] = useState<State>({
    looks:
      initialLooks ??
      HOME_LOOK_DEFS.slice(0, maxLooks).map(lookDefToEmptyLook),
    loading: !seeded,
    error: undefined,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true, error: undefined }));
    try {
      const res = await fetch("/api/feed-looks");
      const json = (await res.json()) as {
        looks?: StylingLook[];
        error?: string;
      };
      if (!res.ok) {
        setState((s) => ({
          ...s,
          loading: false,
          error: json.error ?? `HTTP ${res.status}`,
        }));
        return;
      }
      setState({
        looks: json.looks ?? [],
        loading: false,
        error: undefined,
      });
    } catch (err) {
      setState((s) => ({
        ...s,
        loading: false,
        error: err instanceof Error ? err.message : "Network error",
      }));
    }
  }, []);

  useEffect(() => {
    if (seeded) return;
    void load();
  }, [load, seeded]);

  return { ...state, reload: load };
}
