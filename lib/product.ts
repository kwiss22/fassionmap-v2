export type ProductSource = "naver" | "aliexpress";

export type Product = {
  id: string;
  name: string;
  mall: string;
  /** 네이버 쇼핑 API `mallName` (제휴 매핑용) */
  mallName?: string;
  price: number;
  imageUrl: string;
  link: string;
  category2?: string;
  /** 데이터 출처 (미지정 시 네이버 쇼핑으로 간주) */
  source?: ProductSource;
};

/**
 * 여러 검색/브랜드 피드에서 동일한 네이버 상품이 `id`만 다르게( productId-페이지인덱스 ) 반복될 수 있어,
 * 그리드·무한스크롤에서 물리적으로 같은 상품을 1건만 남기기 위한 키.
 * - `link`가 있으면 호스트+경로(쿼리 제외)로 식별
 * - 없으면 내부 `id`에서 `productId-숫자` 형태일 때 `productId`만 사용 (productId 누락 `naver-*` 는 전체 id)
 */
export function productDedupeKey(p: Product): string {
  const link = p.link?.trim();
  if (link) {
    try {
      const u = new URL(link);
      const path = u.pathname.replace(/\/+$/, "") || "/";
      return `u:${u.hostname.toLowerCase()}${path.toLowerCase()}`;
    } catch {
      // fall through
    }
  }
  const m = p.id.match(/^(.+)-(\d+)$/);
  if (m && m[1] !== "naver") {
    return `p:${m[1]}`;
  }
  return `i:${p.id}`;
}

export function productToDetailHref(product: Product): string {
  const q = new URLSearchParams();
  q.set("id", product.id);
  q.set("n", product.name);
  q.set("p", String(product.price));
  q.set("i", product.imageUrl);
  q.set("l", product.link);
  q.set("m", product.mall);
  if (product.mallName) {
    q.set("mn", product.mallName);
  }
  const source = product.source ?? inferProductSource(product);
  if (source) {
    q.set("src", source);
  }
  return `/product?${q.toString()}`;
}

export function inferProductSource(
  product: Pick<Product, "id" | "source" | "mall">
): ProductSource {
  if (product.source) return product.source;
  if (product.id.startsWith("ali-")) return "aliexpress";
  if (/aliexpress/i.test(product.mall)) return "aliexpress";
  return "naver";
}

export function parseProductFromSearchParams(
  searchParams: URLSearchParams
): Product | null {
  const name = searchParams.get("n");
  const link = searchParams.get("l");
  const imageUrl = searchParams.get("i");
  if (!name || !link || !imageUrl) {
    return null;
  }
  const id = searchParams.get("id") ?? "unknown";
  const price = Number(searchParams.get("p")) || 0;
  const mall = searchParams.get("m") ?? "Naver";
  const mallName = searchParams.get("mn") ?? undefined;
  const src = searchParams.get("src");
  const source: ProductSource | undefined =
    src === "aliexpress" || src === "naver"
      ? src
      : id.startsWith("ali-")
        ? "aliexpress"
        : /aliexpress/i.test(mall)
          ? "aliexpress"
          : "naver";
  return { id, name, price, imageUrl, link, mall, mallName, source };
}
