"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/lib/product";

type UseNaverProductsOptions = {
  /** 목표 상품 수 */
  take?: number;
  /** 1페이지 요청량 (정책 필터 후 여유) */
  display?: number;
  enabled?: boolean;
};

type UseNaverProductsState = {
  items: Product[];
  loading: boolean;
  error?: string;
  queryUsed?: string;
  reload: () => void;
};

function withImage(product: Product): boolean {
  return Boolean(product.imageUrl?.trim());
}

async function fetchNaverPage(
  query: string,
  display: number,
  signal?: AbortSignal
): Promise<{ items: Product[]; error?: string }> {
  const url = `/api/naver-products?query=${encodeURIComponent(query)}&start=1&display=${display}&sort=sim`;
  const res = await fetch(url, { signal });
  const json = (await res.json()) as { items?: Product[]; error?: string };
  if (!res.ok) {
    return { items: [], error: json.error ?? `HTTP ${res.status}` };
  }
  return {
    items: (json.items ?? []).filter(withImage),
    error: json.error,
  };
}

/**
 * 클라이언트에서 `/api/naver-products` 호출.
 * 쿼리 배열을 순서대로 시도해 이미지 있는 상품을 모은다.
 */
export function useNaverProducts(
  queries: string | readonly string[],
  options: UseNaverProductsOptions = {}
): UseNaverProductsState {
  const { take = 6, display = 40, enabled = true } = options;
  const queryList = useMemo(
    () => (typeof queries === "string" ? [queries] : [...queries]),
    [typeof queries === "string" ? queries : queries.join("\0")]
  );

  const [state, setState] = useState<Omit<UseNaverProductsState, "reload">>({
    items: [],
    loading: enabled,
  });

  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    if (!enabled || queryList.length === 0) {
      setState({ items: [], loading: false });
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState((s) => ({ ...s, loading: true, error: undefined }));

    let lastError: string | undefined;
    let queryUsed: string | undefined;

    for (const query of queryList) {
      const trimmed = query.trim();
      if (!trimmed) continue;

      try {
        const { items, error } = await fetchNaverPage(
          trimmed,
          display,
          controller.signal
        );
        if (controller.signal.aborted) return;

        lastError = error;
        if (items.length > 0) {
          queryUsed = trimmed;
          setState({
            items: items.slice(0, take),
            loading: false,
            error: items.length < take ? error : undefined,
            queryUsed,
          });
          return;
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        lastError = err instanceof Error ? err.message : "unknown";
      }
    }

    if (!controller.signal.aborted) {
      setState({
        items: [],
        loading: false,
        error: lastError,
        queryUsed,
      });
    }
  }, [display, enabled, queryList, take]);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { ...state, reload: load };
}
