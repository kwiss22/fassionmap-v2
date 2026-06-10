export type AiRecommendedPrompt = {
  id: string;
  label: string;
  prompt: string;
};

export type AiRecommendedGroup = {
  id: string;
  title: string;
  items: AiRecommendedPrompt[];
};

export const AI_RECOMMENDED_GROUPS: readonly AiRecommendedGroup[] = [
  {
    id: "region",
    title: "Cities & runways",
    items: [
      {
        id: "paris-fw",
        label: "Paris FW",
        prompt:
          "Paris Fashion Week standout womenswear — tweed, oversized coats, quiet luxury",
      },
      {
        id: "milan",
        label: "Milan ranking",
        prompt:
          "Milan fashion week menswear and womenswear — leather, tailoring, elevated basics",
      },
      {
        id: "seoul-street",
        label: "Seoul street",
        prompt:
          "Seoul Seongsu and Hannam street style — minimal black layers for women in their 20s",
      },
      {
        id: "ny-fw",
        label: "NYC week",
        prompt:
          "New York Fashion Week layered looks — denim, blazers, and polished casual for women",
      },
    ],
  },
  {
    id: "mood",
    title: "Mood & occasion",
    items: [
      {
        id: "girlfriend",
        label: "Date night",
        prompt:
          "Soft date-night outfit for women in their 20s — knit, midi skirt, loafers under $200",
      },
      {
        id: "office-30s",
        label: "Office 30s",
        prompt:
          "Minimal office look for women in their 30s — blazer, tailored trousers, loafers",
      },
      {
        id: "weekend",
        label: "Weekend brunch",
        prompt:
          "Weekend brunch outfit — linen shirt, wide pants, clean sneakers for women",
      },
      {
        id: "minimal",
        label: "Minimal daily",
        prompt:
          "Minimal daily uniform — beige and white cotton knits for women in their 20s–30s",
      },
    ],
  },
  {
    id: "celebrity",
    title: "Celebrities & moments",
    items: [
      {
        id: "jennie-paris",
        label: "Jennie Paris",
        prompt:
          "Jennie Paris Fashion Week outfit — Chanel-inspired tweed and black mini dress",
      },
      {
        id: "jisoo-airport",
        label: "Jisoo airport",
        prompt: "Jisoo airport fashion — Dior-tone coat and structured bag styling",
      },
      {
        id: "karina-stage",
        label: "Karina stage",
        prompt: "Karina stage performance look — shoppable similar performance styling",
      },
    ],
  },
] as const;
