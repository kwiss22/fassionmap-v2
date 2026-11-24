import type { Product } from "@/lib/product";

/** One slot in a look card (top, bottom, etc.) */
export type LookPieceRole = "top" | "bottom" | "outer" | "shoes" | "bag";

export type LookPiece = {
  role: LookPieceRole;
  label: string;
  product: Product | null;
};

export type StylingLook = {
  id: string;
  title: string;
  /** Hero overlay line — Make-style eyebrow under the title */
  subtitle?: string;
  /** AI look summary — one sentence shown at the top of the card */
  reason: string;
  context?: string;
  /** Per-slot "why" — static rationale for key pieces */
  pieceWhy?: Partial<Record<LookPieceRole, string>>;
  pieces: LookPiece[];
};

export type StylingLookDef = {
  id: string;
  title: string;
  subtitle?: string;
  reason: string;
  context?: string;
  pieceWhy?: Partial<Record<LookPieceRole, string>>;
  /** Per-slot search query */
  queries: Partial<Record<LookPieceRole, string>>;
};

const ROLE_LABELS: Record<LookPieceRole, string> = {
  top: "Top",
  bottom: "Bottom",
  outer: "Outer",
  shoes: "Shoes",
  bag: "Bag",
};

export const HOME_LOOK_DEFS: readonly StylingLookDef[] = [
  {
    id: "rain-commute",
    title: "Grey Matter",
    subtitle: "City Outerwear",
    reason:
      "A breezy commute layer — clean grey outerwear with structured bottoms, grounded in water-resistant fabric.",
    context: "Commute · Rain",
    pieceWhy: {
      outer:
        "A water-resistant trench defines the line and handles the walk to transit",
      bottom: "Dark slacks ground the look and hide splash marks",
    },
    queries: {
      outer: "women's trench coat",
      top: "women's knit sweater",
      bottom: "women's slacks",
      shoes: "women's loafers",
    },
  },
  {
    id: "weekend-date",
    title: "Soft Hour",
    subtitle: "Weekend Date",
    reason:
      "AI balanced soft knit volume with an A-line skirt for a proportional, polished weekend date silhouette.",
    context: "Date · Weekend",
    pieceWhy: {
      top: "Soft knit adds warmth without heaviness for an evening out",
      bottom: "A-line skirt balances proportions for date-night polish",
    },
    queries: {
      top: "women's knit sweater",
      bottom: "women's midi skirt",
      shoes: "women's loafers",
      bag: "women's shoulder bag",
    },
  },
  {
    id: "minimal-daily",
    title: "Quiet Uniform",
    subtitle: "Minimal Daily",
    reason:
      "AI matched beige-and-white layers to your saved knit mood for a quiet daily uniform.",
    context: "Daily",
    pieceWhy: {
      top: "Cashmere knit anchors the palette you keep saving",
      bottom: "Wide pants keep the line relaxed but intentional",
    },
    queries: {
      top: "cashmere sweater",
      bottom: "women's wide leg pants",
      shoes: "women's sneakers",
    },
  },
  {
    id: "layer-travel",
    title: "Carry-On Layers",
    subtitle: "Travel Edit",
    reason:
      "AI stacked light layers for cabin-to-arrival temperature swings without weighing down your carry-on.",
    context: "Travel",
    pieceWhy: {
      outer: "Light jacket handles airport AC and arrival chill",
      shoes: "Sneakers survive security walks and long gates",
    },
    queries: {
      outer: "women's jacket",
      top: "women's sweatshirt",
      bottom: "women's jogger pants",
      shoes: "women's sneakers",
    },
  },
] as const;

export function lookDefToEmptyLook(def: StylingLookDef): StylingLook {
  const roles = Object.keys(def.queries) as LookPieceRole[];
  return {
    id: def.id,
    title: def.title,
    subtitle: def.subtitle,
    reason: def.reason,
    context: def.context,
    pieceWhy: def.pieceWhy,
    pieces: roles.map((role) => ({
      role,
      label: ROLE_LABELS[role],
      product: null,
    })),
  };
}

export function mergeLookProducts(
  def: StylingLookDef,
  byRole: Partial<Record<LookPieceRole, Product | null>>
): StylingLook {
  const roles = Object.keys(def.queries) as LookPieceRole[];
  return {
    id: def.id,
    title: def.title,
    subtitle: def.subtitle,
    reason: def.reason,
    context: def.context,
    pieceWhy: def.pieceWhy,
    pieces: roles.map((role) => ({
      role,
      label: ROLE_LABELS[role],
      product: byRole[role] ?? null,
    })),
  };
}
