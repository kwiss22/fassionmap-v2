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
};

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
  return `/product?${q.toString()}`;
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
  const mall = searchParams.get("m") ?? "네이버";
  const mallName = searchParams.get("mn") ?? undefined;
  return { id, name, price, imageUrl, link, mall, mallName };
}
