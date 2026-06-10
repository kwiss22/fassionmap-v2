import { z } from "zod";

import { getCachedAiSearch } from "@/lib/ai/cache";
import { curateAiSearch } from "@/lib/ai/ai-search";
import { assertAiDailyBudget } from "@/lib/ai/rate-limit";
import { APP_MARKET } from "@/lib/market";

const requestSchema = z.object({
  prompt: z.string().min(2).max(500),
  locale: z.enum(["ko-KR", "en-US"]).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestSchema.parse(body);
    const input = {
      prompt: parsed.prompt.trim(),
      locale: parsed.locale ?? APP_MARKET.locale,
    };

    const cached = getCachedAiSearch(input);
    if (cached) {
      return Response.json({ ok: true, cached: true, data: cached });
    }

    assertAiDailyBudget();
    const data = await curateAiSearch(input);

    return Response.json({ ok: true, cached: false, data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json(
        { ok: false, error: "Invalid request payload", issues: error.issues },
        { status: 400 }
      );
    }

    const message =
      error instanceof Error ? error.message : "Failed to curate AI search";
    const status = message.includes("일일 호출") ? 429 : 500;
    return Response.json({ ok: false, error: message }, { status });
  }
}
