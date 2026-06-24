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

/** Feed 룩 카드용 — 슬롯별 네이버 상품 1건씩 (쿼리 dedupe) */
export async function getFeedLooks(maxLooks = 4): Promise<StylingLook[]> {
  const defs = HOME_LOOK_DEFS.slice(0, maxLooks);
  const cache = new Map<string, Product | null>();
  const looks: StylingLook[] = [];

  for (const def of defs) {
    const roles = Object.keys(def.queries) as LookPieceRole[];
    const byRole: Partial<Record<LookPieceRole, Product | null>> = {};

    for (const role of roles) {
      const q = def.queries[role];
      if (!q) continue;
      byRole[role] = await fetchPieceProduct(q, cache);
    }

    looks.push(mergeLookProducts(def, byRole));
  }

  return looks;
}

export function looksHaveProducts(looks: StylingLook[]): boolean {
  return looks.some((look) => look.pieces.some((p) => p.product?.imageUrl));
}
