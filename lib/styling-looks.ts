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
    title: "Rainy day commute",
    reason:
      "For a rainy commute, AI paired a water-resistant outer with dark bottoms to keep your silhouette sharp without extra bulk.",
    context: "Commute · Rain",
    pieceWhy: {
      outer:
        "A water-resistant trench defines the line and handles the walk to transit",
      bottom: "Dark slacks ground the look and hide splash marks",
    },
    queries: {
      outer: "women trench coat",
      top: "women knit sweater",
      bottom: "women slacks",
      shoes: "women loafers",
    },
  },
  {
    id: "weekend-date",
    title: "Weekend date",
    reason:
      "AI balanced soft knit volume with an A-line skirt for a proportional, polished weekend date silhouette.",
    context: "Date · Weekend",
    pieceWhy: {
      top: "Soft knit adds warmth without heaviness for an evening out",
      bottom: "A-line skirt balances proportions for date-night polish",
    },
    queries: {
      top: "women knit sweater",
      bottom: "women midi skirt",
      shoes: "women loafers",
      bag: "women shoulder bag",
    },
  },
  {
    id: "minimal-daily",
    title: "Minimal daily",
    reason:
      "AI matched beige-and-white layers to your saved knit mood for a quiet daily uniform.",
    context: "Daily",
    pieceWhy: {
      top: "Cashmere knit anchors the palette you keep saving",
      bottom: "Wide pants keep the line relaxed but intentional",
    },
    queries: {
      top: "women cashmere knit",
      bottom: "women wide pants",
      shoes: "women sneakers",
    },
  },
  {
    id: "layer-travel",
    title: "In-flight layers",
    reason:
      "AI stacked light layers for cabin-to-arrival temperature swings without weighing down your carry-on.",
    context: "Travel",
    pieceWhy: {
      outer: "Light jacket handles airport AC and arrival chill",
      shoes: "Sneakers survive security walks and long gates",
    },
    queries: {
      outer: "women jacket",
      top: "women sweatshirt",
      bottom: "women jogger pants",
      shoes: "women sneakers",
    },
  },
] as const;

export function lookDefToEmptyLook(def: StylingLookDef): StylingLook {
  const roles = Object.keys(def.queries) as LookPieceRole[];
  return {
    id: def.id,
    title: def.title,
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
