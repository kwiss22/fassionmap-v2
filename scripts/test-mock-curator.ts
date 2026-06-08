import { MockProvider } from "../lib/ai/providers/mock";
import type { CurationInput } from "../lib/ai/types";

async function main() {
  const provider = new MockProvider();

  const sampleInput: CurationInput = {
    issueMeta: {
      vol: "08",
      season: "FW26",
      date: "05 · 07 · 26",
      city: "SEOUL",
    },
    trendSignals: ["캐시미어", "미니멀", "뉴트럴 톤"],
    candidateProducts: [
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
    ],
    maxSections: 3,
    locale: "ko-KR",
  };

  const result = await provider.generateIssueDraft(sampleInput, {
    maxOutputTokens: 1024,
    temperature: 0,
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
