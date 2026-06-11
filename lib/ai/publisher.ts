import { curateNewIssue } from "@/lib/ai/curator";
import { pickCoverImage } from "@/lib/ai/cover-image";
import type { CurationInput, IssueDraft, LLMProvider } from "@/lib/ai/types";
import type { EditorialIssue } from "@/lib/editorial";
import { getNextVol, saveIssue } from "@/lib/issue-store";
import type { Product } from "@/lib/product";

export type PublishIssueInput = {
  trendSignals?: string[];
  candidateProducts?: Product[];
  maxSections?: number;
  locale?: CurationInput["locale"];
  season?: string;
  city?: string;
  date?: string;
  provider?: LLMProvider;
};

const DEFAULT_TREND_SIGNALS = [
  "cashmere",
  "minimal tailoring",
  "neutral tones",
];

const DEFAULT_CANDIDATE_PRODUCTS: Product[] = [
  {
    id: "pub-p-1",
    name: "Hermes cashmere coat",
    mall: "naver",
    mallName: "Hermes Official",
    price: 1200000,
    imageUrl: "https://example.com/p1.jpg",
    link: "https://example.com/p1",
  },
  {
    id: "pub-p-2",
    name: "Minimal wool knit",
    mall: "naver",
    mallName: "W Concept",
    price: 210000,
    imageUrl: "https://example.com/p2.jpg",
    link: "https://example.com/p2",
  },
  {
    id: "pub-p-3",
    name: "Neutral tone wide slacks",
    mall: "naver",
    mallName: "29CM",
    price: 159000,
    imageUrl: "https://example.com/p3.jpg",
    link: "https://example.com/p3",
  },
];

function formatIssueDate(d = new Date()): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm} · ${dd} · ${yy}`;
}

function applyCoverPool(draft: IssueDraft, vol: string): EditorialIssue {
  const cover = pickCoverImage(`${vol}-${draft.city}-${draft.season}`);
  return {
    ...draft,
    coverImage: cover.coverImage,
    coverAlt: cover.coverAlt,
    coverFocal: cover.coverFocal,
  };
}

/**
 * AI 큐레이터로 새 이슈를 생성하고 `data/issues/vol-NNN.json`에 저장한다.
 * git commit / push는 하지 않는다 — 운영자가 검토 후 수동 커밋.
 */
export async function publishIssue(
  input: PublishIssueInput = {}
): Promise<{ filepath: string; issue: EditorialIssue }> {
  const vol = getNextVol();
  const curationInput: CurationInput = {
    issueMeta: {
      vol,
      season: input.season ?? "FW26",
      date: input.date ?? formatIssueDate(),
      city: input.city ?? "SEOUL",
    },
    trendSignals: input.trendSignals ?? DEFAULT_TREND_SIGNALS,
    candidateProducts: input.candidateProducts ?? DEFAULT_CANDIDATE_PRODUCTS,
    maxSections: input.maxSections ?? 3,
    locale: input.locale ?? "en-US",
  };

  const draft = await curateNewIssue(curationInput, {
    provider: input.provider,
    maxOutputTokens: 1024,
    retryCount: 1,
  });

  const issue = applyCoverPool({ ...draft, vol }, vol);
  const filepath = saveIssue(issue);
  return { filepath, issue };
}
