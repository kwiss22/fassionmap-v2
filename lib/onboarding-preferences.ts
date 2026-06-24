export const FIT_STORAGE_KEY = "fashionmap_fit_v1";
export const VIBES_STORAGE_KEY = "fashionmap_vibes_v1";
export const ONBOARDING_DONE_KEY = "fashionmap_onboarding_done_v1";

export type BodyFitId = "slim" | "regular" | "oversized";

export type BodyFitOption = {
  id: BodyFitId;
  label: string;
  sub: string;
};

export type VibeOption = {
  id: string;
  label: string;
};

export const BODY_FIT_OPTIONS: readonly BodyFitOption[] = [
  { id: "slim", label: "Slim", sub: "Tapered" },
  { id: "regular", label: "Regular", sub: "Classic" },
  { id: "oversized", label: "Oversized", sub: "Relaxed" },
];

export const VIBE_OPTIONS: readonly VibeOption[] = [
  { id: "minimal", label: "#Minimal" },
  { id: "cityboy", label: "#CityBoy" },
  { id: "streetwear", label: "#Streetwear" },
  { id: "vintage", label: "#Vintage" },
  { id: "amekaji", label: "#Amekaji" },
  { id: "gorpcore", label: "#Gorpcore" },
  { id: "prep", label: "#CleanPrep" },
  { id: "techwear", label: "#Techwear" },
  { id: "quietlux", label: "#QuietLux" },
  { id: "monochrome", label: "#Monochrome" },
];

export function bodyFitIdToLabel(id: BodyFitId): string {
  return BODY_FIT_OPTIONS.find((o) => o.id === id)?.label ?? "Regular";
}

export function isOnboardingComplete(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(ONBOARDING_DONE_KEY) === "true";
}

export function markOnboardingComplete(): void {
  localStorage.setItem(ONBOARDING_DONE_KEY, "true");
}

export function saveOnboardingPreferences(
  fitId: BodyFitId,
  vibeIds: string[]
): void {
  localStorage.setItem(FIT_STORAGE_KEY, bodyFitIdToLabel(fitId));
  localStorage.setItem(VIBES_STORAGE_KEY, JSON.stringify(vibeIds));
}

export function readFitPreference(): string {
  if (typeof window === "undefined") return "Regular";
  return localStorage.getItem(FIT_STORAGE_KEY) ?? "Regular";
}

export function readVibePreferences(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(VIBES_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((v): v is string => typeof v === "string")
      : [];
  } catch {
    return [];
  }
}

export function resetOnboardingForDev(): void {
  localStorage.removeItem(ONBOARDING_DONE_KEY);
  localStorage.removeItem(FIT_STORAGE_KEY);
  localStorage.removeItem(VIBES_STORAGE_KEY);
}

export function readVibeLabels(vibeIds: string[]): string[] {
  return vibeIds
    .map((id) => VIBE_OPTIONS.find((v) => v.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}
