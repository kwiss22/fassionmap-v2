import type { Product } from "@/lib/product";
import { extractBrand } from "@/lib/brand-extract";

export type LabCategory = "Top" | "Bottom" | "Shoes" | "Accessory";

export const LAB_CATEGORIES: LabCategory[] = [
  "Top",
  "Bottom",
  "Shoes",
  "Accessory",
];

export const LAB_SLOT_HEIGHT: Record<LabCategory, string> = {
  Top: "64px",
  Bottom: "56px",
  Shoes: "48px",
  Accessory: "40px",
};

export const LAB_CATEGORY_QUERIES: Record<LabCategory, string> = {
  Top: "women top",
  Bottom: "women pants",
  Shoes: "women sneakers",
  Accessory: "women bag",
};

export type LabWardrobeItem = {
  id: string;
  category: LabCategory;
  product: Product;
};

export function productToLabItem(
  product: Product,
  category: LabCategory
): LabWardrobeItem {
  return { id: `${category}-${product.id}`, category, product };
}

export function labBrandLabel(product: Product): string {
  return (
    extractBrand(product.name) ??
    product.mallName ??
    product.mall ??
    "Brand"
  );
}

const SHOE_RE =
  /sneaker|loafer|boot|heel|sandal|shoe|trainer|mule|flat|oxford/i;
const BOTTOM_RE =
  /pant|jean|denim|skirt|trouser|short|jogger|legging|chino|slack/i;
const ACCESSORY_RE =
  /bag|watch|belt|scarf|hat|cap|sunglass|glasses|jewelry|necklace|earring|bracelet|wallet|tote|clutch/i;

export function inferLabCategory(product: Product): LabCategory {
  const name = product.name;
  if (SHOE_RE.test(name)) return "Shoes";
  if (BOTTOM_RE.test(name)) return "Bottom";
  if (ACCESSORY_RE.test(name)) return "Accessory";
  return "Top";
}

export function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)] ?? null;
}

export function buildAiOutfitPrompt(fit: string): string {
  return `Complete a cohesive everyday outfit for a ${fit} fit. Include top, bottom, shoes, and one accessory. Keep it shoppable and modern.`;
}
