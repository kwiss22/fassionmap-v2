import { z } from "zod";

import { getCachedIssueDraft, setCachedIssueDraft } from "@/lib/ai/cache";
import { curateNewIssue } from "@/lib/ai/curator";
import type { CurationInput } from "@/lib/ai/types";

const issueMetaSchema = z.object({
  vol: z.string(),
  season: z.string(),
  date: z.string(),
  city: z.string(),
});

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  mall: z.string(),
  mallName: z.string().optional(),
  price: z.number(),
  imageUrl: z.string(),
  link: z.string(),
  category2: z.string().optional(),
});

const requestSchema = z.object({
  issueMeta: issueMetaSchema,
  trendSignals: z.array(z.string()).default([]),
  candidateProducts: z.array(productSchema),
  maxSections: z.number().int().positive().optional(),
  locale: z.enum(["ko-KR", "en-US"]).optional(),
  options: z
    .object({
      maxOutputTokens: z.number().int().positive().optional(),
      temperature: z.number().optional(),
      retryCount: z.number().int().min(0).optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);

    const input: CurationInput = {
      issueMeta: parsed.issueMeta,
      trendSignals: parsed.trendSignals,
      candidateProducts: parsed.candidateProducts,
      maxSections: parsed.maxSections,
      locale: parsed.locale,
    };

    const cached = getCachedIssueDraft(input);
    if (cached) {
      return Response.json({ ok: true, cached: true, data: cached });
    }

    const data = await curateNewIssue(input, parsed.options);
    setCachedIssueDraft(input, data);

    return Response.json({ ok: true, cached: false, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        {
          ok: false,
          error: "Invalid request payload",
          issues: error.issues,
        },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to curate issue";
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}
