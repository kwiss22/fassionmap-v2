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
  const no = String(index + 1).padStart(2, "0");
  return `SS'25 · NO.${no}`;
}

export function feedGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export {
  FIT_STORAGE_KEY,
  readFitPreference,
  readVibePreferences,
  VIBE_OPTIONS,
} from "@/lib/onboarding-preferences";

/** Onboarding vibe id → feed filter chip */
export const VIBE_TO_FEED_FILTER: Partial<
  Record<string, FeedFilterId>
> = {
  cityboy: "city",
  minimal: "minimal",
  streetwear: "street",
  gorpcore: "city",
  amekaji: "city",
  prep: "minimal",
  quietlux: "minimal",
  vintage: "street",
  techwear: "street",
  monochrome: "minimal",
};

export function defaultFeedFilterFromVibes(vibeIds: string[]): FeedFilterId {
  for (const id of vibeIds) {
    const mapped = VIBE_TO_FEED_FILTER[id];
    if (mapped) return mapped;
  }
  return "all";
}
