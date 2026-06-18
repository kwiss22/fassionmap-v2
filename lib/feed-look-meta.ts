import type { LookPieceRole } from "@/lib/styling-looks";

export type FeedFilterId = "all" | "city" | "minimal" | "street" | "vacation";

export const FEED_FILTERS: { id: FeedFilterId; label: string }[] = [
  { id: "all", label: "For You" },
  { id: "city", label: "CityBoy" },
  { id: "minimal", label: "Minimal" },
  { id: "street", label: "Streetwear" },
  { id: "vacation", label: "Vacation" },
];

/** Look id → filter bucket */
export const LOOK_FILTER: Record<string, FeedFilterId> = {
  "rain-commute": "city",
  "weekend-date": "street",
  "minimal-daily": "minimal",
  "layer-travel": "vacation",
};

export const LOOK_TAGS: Record<string, string[]> = {
  "rain-commute": ["#Commute", "#Rain", "#Minimal"],
  "weekend-date": ["#Date", "#Weekend", "#Soft"],
  "minimal-daily": ["#Daily", "#Minimal", "#Quiet"],
  "layer-travel": ["#Travel", "#Layered", "#Comfort"],
};

export const HOTSPOT_POS: Record<LookPieceRole, { x: number; y: number }> = {
  outer: { x: 42, y: 28 },
  top: { x: 52, y: 42 },
  bottom: { x: 48, y: 72 },
  shoes: { x: 35, y: 88 },
  bag: { x: 72, y: 55 },
};

export function feedEdition(index: number): string {
  return `VOL.${String(index + 8).padStart(3, "0")}`;
}

export function feedGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export { FIT_STORAGE_KEY, readFitPreference } from "@/lib/onboarding-preferences";
