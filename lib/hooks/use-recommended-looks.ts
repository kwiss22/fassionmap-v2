"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "@/lib/product";
import {
  HOME_LOOK_DEFS,
  mergeLookProducts,
  lookDefToEmptyLook,
  type LookPieceRole,
  type StylingLook,
} from "@/lib/styling-looks";

type State = {
  looks: StylingLook[];
  loading: boolean;
};

async function fetchFirstProduct(query: string): Promise<Product | null> {
  const url = `/api/naver-products?query=${encodeURIComponent(query)}&start=1&display=8&sort=sim`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const json = (await res.json()) as { items?: Product[] };
  return json.items?.[0] ?? null;
}

/**
 * 홈 추천 룩 — 정의된 슬롯별로 네이버 API 1건씩만 가져와 룩 카드를 구성한다.
 * (전체 AI 큐레이션 API는 홈에서 호출하지 않음 — 비용·속도)
 */
export function useRecommendedLooks(maxLooks = 4) {
  const [state, setState] = useState<State>({
    looks: HOME_LOOK_DEFS.slice(0, maxLooks).map(lookDefToEmptyLook),
    loading: true,
  });

  const load = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    const defs = HOME_LOOK_DEFS.slice(0, maxLooks);

    const looks = await Promise.all(
      defs.map(async (def) => {
        const roles = Object.keys(def.queries) as LookPieceRole[];
        const entries = await Promise.all(
          roles.map(async (role) => {
            const q = def.queries[role];
            if (!q) return [role, null] as const;
            const product = await fetchFirstProduct(q);
            return [role, product] as const;
          })
        );
        const byRole = Object.fromEntries(entries) as Partial<
          Record<LookPieceRole, Product | null>
        >;
        return mergeLookProducts(def, byRole);
      })
    );

    setState({ looks, loading: false });
  }, [maxLooks]);

  useEffect(() => {
    void load();
  }, [load]);

  return { ...state, reload: load };
}
