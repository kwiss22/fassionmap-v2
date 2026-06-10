import type { Product } from "@/lib/product";
import { formatKrwAmount } from "@/lib/utils";

export type DisplayCurrency = "USD" | "KRW";

/** Native listing currency — AliExpress API returns USD; Naver returns KRW. */
export function productDisplayCurrency(product: Pick<Product, "source">): DisplayCurrency {
  return product.source === "aliexpress" ? "USD" : "KRW";
}

export function formatAmount(amount: number, currency: DisplayCurrency): string {
  if (currency === "USD") {
    const rounded = Math.round(amount * 100) / 100;
    const hasCents = Math.abs(rounded % 1) >= 0.005;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(rounded);
  }
  return `₩${formatKrwAmount(Math.round(amount))}`;
}

export function formatProductPrice(
  product: Pick<Product, "price" | "source">,
  currency?: DisplayCurrency
): string {
  return formatAmount(product.price, currency ?? productDisplayCurrency(product));
}
