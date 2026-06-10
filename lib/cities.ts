/**
 * Atlas signature section — city metadata.
 *
 * - Coords are [longitude, latitude] (GeoJSON / d3-geo convention).
 * - `brandSlugs`: curated brands associated with each fashion capital.
 * - `intro`: short editor copy for the side panel.
 */

export type City = {
  slug: string;
  displayName: string;
  displayKo: string;
  country: string;
  coords: [number, number];
  intro: string;
  brandSlugs: readonly string[];
};

export const CITIES: readonly City[] = [
  {
    slug: "paris",
    displayName: "Paris",
    displayKo: "파리",
    country: "FR",
    coords: [2.3522, 48.8566],
    intro:
      "Hermès, Celine, Balenciaga, Maison Margiela… Paris remains the home of quiet luxury.",
    brandSlugs: [
      "hermes",
      "celine",
      "louis-vuitton",
      "chanel",
      "dior",
      "dior-homme",
      "balenciaga",
      "saint-laurent",
      "lemaire",
      "chloe",
      "ami-paris",
      "jacquemus",
      "maison-margiela",
      "wooyoungmi",
      "juun-j",
    ],
  },
  {
    slug: "milan",
    displayName: "Milan",
    displayKo: "밀라노",
    country: "IT",
    coords: [9.19, 45.4642],
    intro:
      "Prada, Gucci, Bottega Veneta. Italian craft at its most modern.",
    brandSlugs: [
      "prada",
      "gucci",
      "bottega-veneta",
      "valentino",
      "ferragamo",
      "miu-miu",
      "armani",
      "etro",
      "marni",
      "moncler",
      "tods",
    ],
  },
  {
    slug: "london",
    displayName: "London",
    displayKo: "런던",
    country: "GB",
    coords: [-0.1276, 51.5074],
    intro:
      "From Burberry classics to Alexander McQueen's dark romance — London's signature sharpness.",
    brandSlugs: ["burberry", "alexander-mcqueen", "palace"],
  },
  {
    slug: "new-york",
    displayName: "New York",
    displayKo: "뉴욕",
    country: "US",
    coords: [-74.006, 40.7128],
    intro:
      "Ralph Lauren heritage, Tom Ford glamour, Thom Browne rigor — the city is a wardrobe.",
    brandSlugs: [
      "polo-ralph-lauren",
      "calvin-klein",
      "coach",
      "tory-burch",
      "marc-jacobs",
      "tommy-hilfiger",
      "supreme",
      "tom-ford",
      "thom-browne",
    ],
  },
  {
    slug: "tokyo",
    displayName: "Tokyo",
    displayKo: "도쿄",
    country: "JP",
    coords: [139.6917, 35.6895],
    intro:
      "Comme des Garçons, Issey Miyake, Visvim. The city that thinks deepest about clothes.",
    brandSlugs: [
      "comme-des-garcons",
      "issey-miyake",
      "kapital",
      "orslow",
      "yohji-yamamoto",
      "visvim",
    ],
  },
  {
    slug: "seoul",
    displayName: "Seoul",
    displayKo: "서울",
    country: "KR",
    coords: [126.978, 37.5665],
    intro:
      "Matin Kim, Ader Error, System. A new contemporary capital — curated beside the global maisons.",
    brandSlugs: [
      "matin-kim",
      "ader-error",
      "system",
      "recto",
      "d-antidote",
      "songzio",
    ],
  },
  {
    slug: "copenhagen",
    displayName: "Copenhagen",
    displayKo: "코펜하겐",
    country: "DK",
    coords: [12.5683, 55.6761],
    intro: "Ganni, Acne Studios. Nordic restraint meets bold color.",
    brandSlugs: ["ganni", "acne-studios"],
  },
];

const CITY_BY_SLUG = new Map(CITIES.map((c) => [c.slug, c]));

export function getCityBySlug(slug: string): City | undefined {
  return CITY_BY_SLUG.get(slug);
}

/** Per-city piece count — placeholder until wired to real data. */
export function getCityPieceCount(slug: string): number {
  const c = getCityBySlug(slug);
  if (!c) return 0;
  return Math.max(3, Math.min(c.brandSlugs.length + 2, 14));
}
