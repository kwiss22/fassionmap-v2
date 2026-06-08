"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ZodError } from "zod";

import { MockProvider } from "@/lib/ai/providers/mock";
import type { CurationInput, IssueDraft, LLMProvider } from "@/lib/ai/types";

/** Server Action 결과 플래시 (page.tsx와 동일 문자열 유지) */
const ADMIN_AI_TEST_RESULT_COOKIE = "fassionmap_admin_ai_test_v1";

const ALLOWED_CITIES = ["SEOUL", "TOKYO", "MILANO"] as const;
const ALLOWED_SEASONS = ["FW26", "SS27"] as const;

type ActionResult =
  | { ok: true; data: IssueDraft }
  | { ok: false; error: string };

function formatSeoulIssueDate(date: Date): string {
  const s = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  }).format(date);
  const [mm, dd, yy] = s.split("/");
  return `${mm} · ${dd} · ${yy}`;
}

function parseTrendSignals(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

const SAMPLE_PRODUCTS: CurationInput["candidateProducts"] = [
  {
    id: "p-1",
    name: "Hermes cashmere coat",
    mall: "네이버",
    mallName: "Hermes Official",
    price: 1200000,
    imageUrl: "https://example.com/p1.jpg",
    link: "https://example.com/p1",
  },
  {
    id: "p-2",
    name: "Minimal wool knit",
    mall: "네이버",
    mallName: "W Concept",
    price: 210000,
    imageUrl: "https://example.com/p2.jpg",
    link: "https://example.com/p2",
  },
  {
    id: "p-3",
    name: "Neutral tone wide slacks",
    mall: "네이버",
    mallName: "29CM",
    price: 159000,
    imageUrl: "https://example.com/p3.jpg",
    link: "https://example.com/p3",
  },
];

export async function generateIssueDraftAction(
  formData: FormData
): Promise<void> {
  const cityRaw = String(formData.get("city") ?? "");
  const seasonRaw = String(formData.get("season") ?? "");
  const trendRaw = String(formData.get("trendSignals") ?? "");

  const city = (ALLOWED_CITIES as readonly string[]).includes(cityRaw)
    ? cityRaw
    : "SEOUL";
  const season = (ALLOWED_SEASONS as readonly string[]).includes(seasonRaw)
    ? seasonRaw
    : "FW26";

  const trendSignals = parseTrendSignals(trendRaw);

  const input: CurationInput = {
    issueMeta: {
      vol: "08",
      season,
      date: formatSeoulIssueDate(new Date()),
      city,
    },
    trendSignals,
    candidateProducts: SAMPLE_PRODUCTS,
    maxSections: 3,
    locale: "ko-KR",
  };

  let payload: ActionResult;

  try {
    const provider: LLMProvider = new MockProvider();
    const data = await provider.generateIssueDraft(input, {
      maxOutputTokens: 1024,
      temperature: 0,
    });
    payload = { ok: true, data };
  } catch (e) {
    if (e instanceof ZodError) {
      const msg = e.issues.map((i) => i.message).join("; ") || "Zod 검증 실패";
      payload = { ok: false, error: msg };
    } else if (e instanceof Error) {
      payload = { ok: false, error: e.message };
    } else {
      payload = { ok: false, error: String(e) };
    }
  }

  const store = await cookies();
  store.set(ADMIN_AI_TEST_RESULT_COOKIE, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    path: "/admin/ai-test",
    maxAge: 300,
  });

  redirect("/admin/ai-test");
}
