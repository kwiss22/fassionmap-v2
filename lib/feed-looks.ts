import { fetchNaverProductsPage } from "@/lib/api";
import type { Product } from "@/lib/product";
import {
  HOME_LOOK_DEFS,
  mergeLookProducts,
  type LookPieceRole,
  type StylingLook,
} from "@/lib/styling-looks";

async function fetchPieceProduct(
  query: string,
  cache: Map<string, Product | null>
): Promise<Product | null> {
  const key = query.trim();
  if (!key) return null;
  if (cache.has(key)) return cache.get(key)!;

  try {
    const page = await fetchNaverProductsPage(key, {
      start: 1,
      display: 24,
      sort: "sim",
    });
    const product =
      page.items.find((p) => Boolean(p.imageUrl?.trim())) ??
      page.items[0] ??
      null;
    cache.set(key, product);
    return product;
  } catch {
    cache.set(key, null);
    return null;
  }
}

/**
 * Feed 룩 카드용 — 슬롯별 상품 1건씩 (쿼리 dedupe).
 *
 * 쿼리별 fetch는 서로 독립적이라 병렬로 돌린다 — 순차 await로 하면
 * 룩 4개 × 슬롯 3~4개 = 12~16개 요청이 직렬로 쌓여 AliExpress 왕복 지연이
 * 그대로 곱해진다 (실측 10초+). 먼저 유니크 쿼리를 모아 한 번에 Promise.all.
 */
export async function getFeedLooks(maxLooks = 4): Promise<StylingLook[]> {
  const defs = HOME_LOOK_DEFS.slice(0, maxLooks);

  const uniqueQueries = new Set<string>();
  for (const def of defs) {
    for (const q of Object.values(def.queries)) {
      const key = q?.trim();
      if (key) uniqueQueries.add(key);
    }
  }

  const cache = new Map<string, Product | null>();
  await Promise.all(
    Array.from(uniqueQueries).map((key) => fetchPieceProduct(key, cache))
  );

  return defs.map((def) => {
    const roles = Object.keys(def.queries) as LookPieceRole[];
    const byRole: Partial<Record<LookPieceRole, Product | null>> = {};

    for (const role of roles) {
      const q = def.queries[role]?.trim();
      byRole[role] = q ? (cache.get(q) ?? null) : null;
    }

    return mergeLookProducts(def, byRole);
  });
}

export function looksHaveProducts(looks: StylingLook[]): boolean {
  return looks.some((look) => look.pieces.some((p) => p.product?.imageUrl));
}
