import { z } from "zod";

const editorialSectionSourceSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("brand"),
    brandSlug: z.string(),
    category: z.string().optional(),
  }),
  z.object({
    type: z.literal("theme"),
    query: z.string(),
    size: z.number().optional(),
  }),
  z.object({
    type: z.literal("saved-ai"),
  }),
]);

export const issueDraftSectionSchema = z.object({
  id: z.string(),
  eyebrow: z.string(),
  title: z.string(),
  titleHighlight: z.string().optional(),
  subtitle: z.string().optional(),
  source: editorialSectionSourceSchema,
  size: z.number().optional(),
});

export const issueDraftSchema = z.object({
  vol: z.string(),
  season: z.string(),
  title: z.string(),
  titleHighlight: z.string().optional(),
  dek: z.string(),
  date: z.string(),
  city: z.string(),
  coverLabel: z.string(),
  coverImage: z.string(),
  coverAlt: z.string(),
  coverFocal: z.string().optional(),
  primaryCtaLabel: z.string(),
  primaryCtaHref: z.string(),
  secondaryCtaLabel: z.string(),
  secondaryCtaHref: z.string(),
  tickerItems: z.array(z.string()),
  sections: z.array(issueDraftSectionSchema),
});

export type IssueDraftSectionSchema = z.infer<typeof issueDraftSectionSchema>;
export type IssueDraftSchema = z.infer<typeof issueDraftSchema>;

export const aiSearchPlanSchema = z.object({
  summary: z.string().min(1).max(400),
  searches: z
    .array(
      z.object({
        query: z.string().min(1).max(80),
        intent: z.string().max(120).optional(),
      })
    )
    .min(1)
    .max(3),
  picks: z
    .array(
      z.object({
        searchIndex: z.number().int().min(0).max(2),
        rank: z.number().int().min(0).max(9),
        reason: z.string().min(1).max(220),
      })
    )
    .min(1)
    .max(8),
});

export type AiSearchPlanSchema = z.infer<typeof aiSearchPlanSchema>;

export const lookBriefSchema = z.object({
  headline: z.string().min(1).max(120),
  whereFrom: z.string().min(1).max(160),
  brandOrItem: z.string().min(1).max(120),
  priceNote: z.string().min(1).max(200),
  shoppingPriceRange: z.string().max(120).optional(),
  editorialSummary: z.string().min(1).max(500),
});

export type LookBriefSchema = z.infer<typeof lookBriefSchema>;
