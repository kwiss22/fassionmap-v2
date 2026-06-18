/** v2.1 Trend Map — stylized SVG coords (viewBox 350×200) */

export const TREND_MAP_LAND_PATHS: readonly string[] = [
  "M 18,27 L 28,20 L 42,18 L 58,16 L 72,18 L 88,16 L 100,20 L 112,22 L 125,20 L 135,26 L 138,34 L 132,42 L 128,52 L 122,62 L 114,74 L 105,84 L 96,92 L 86,98 L 76,96 L 68,90 L 60,84 L 52,78 L 44,70 L 38,60 L 32,48 L 24,38 Z",
  "M 80,108 L 96,104 L 112,110 L 122,120 L 122,134 L 118,148 L 110,160 L 100,168 L 88,166 L 78,156 L 72,142 L 70,128 L 72,116 Z",
  "M 168,44 L 178,40 L 192,36 L 204,36 L 212,40 L 218,46 L 214,52 L 206,56 L 196,60 L 184,62 L 175,60 L 168,56 L 164,50 Z",
  "M 180,24 L 196,20 L 208,22 L 212,30 L 206,38 L 196,36 L 186,34 L 180,30 Z",
  "M 164,68 L 178,64 L 196,64 L 210,68 L 220,76 L 222,88 L 218,102 L 214,118 L 208,132 L 200,148 L 190,158 L 180,162 L 170,156 L 162,142 L 158,126 L 156,108 L 158,90 L 160,78 Z",
  "M 212,56 L 228,54 L 238,60 L 240,72 L 234,82 L 224,88 L 216,84 L 210,74 L 210,62 Z",
  "M 210,28 L 228,22 L 250,18 L 270,16 L 290,18 L 308,22 L 320,28 L 332,34 L 335,44 L 328,54 L 318,62 L 304,70 L 288,76 L 272,80 L 256,82 L 240,78 L 226,72 L 216,64 L 210,54 L 208,42 Z",
  "M 238,72 L 250,68 L 258,74 L 258,86 L 252,96 L 244,100 L 238,94 L 234,82 Z",
  "M 311,52 L 318,50 L 322,56 L 318,64 L 312,66 L 308,60 Z",
  "M 280,120 L 298,114 L 318,116 L 332,122 L 336,132 L 330,144 L 316,150 L 298,150 L 284,144 L 278,134 L 278,126 Z",
];

export type TrendMapCity = {
  id: string;
  /** `lib/cities` slug for CTA wiring */
  slug: string;
  name: string;
  country: string;
  x: number;
  y: number;
  neon: string;
  heat: number;
  trend: string;
  tags: readonly string[];
  thumbs: readonly string[];
  stat: string;
};

export const TREND_MAP_CITIES: readonly TrendMapCity[] = [
  {
    id: "tokyo",
    slug: "tokyo",
    name: "Tokyo",
    country: "Japan",
    x: 311,
    y: 61,
    neon: "#39ff7a",
    heat: 98,
    trend: "Gorpcore × CityBoy",
    tags: ["#Gorpcore", "#CityBoy", "#LayeredFit"],
    thumbs: [
      "https://images.unsplash.com/flagged/photo-1553965860-a53f9a484a3b?w=140&h=170&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1490761622464-a51ba63053e7?w=140&h=170&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1509137402245-c4c731da2770?w=140&h=170&fit=crop&auto=format",
    ],
    stat: "+34% this week",
  },
  {
    id: "seoul",
    slug: "seoul",
    name: "Seoul",
    country: "South Korea",
    x: 299,
    y: 58,
    neon: "#00c8ff",
    heat: 94,
    trend: "K-Street × Clean Prep",
    tags: ["#KStreet", "#CleanPrep", "#Oversized"],
    thumbs: [
      "https://images.unsplash.com/photo-1594608979954-99483d3334ec?w=140&h=170&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1682783432407-75b14dd288d3?w=140&h=170&fit=crop&auto=format",
      "https://images.unsplash.com/flagged/photo-1553965860-a53f9a484a3b?w=140&h=170&fit=crop&auto=format",
    ],
    stat: "+21% this week",
  },
  {
    id: "paris",
    slug: "paris",
    name: "Paris",
    country: "France",
    x: 177,
    y: 46,
    neon: "#39ff7a",
    heat: 91,
    trend: "Quiet Luxury × Parisian Edge",
    tags: ["#QuietLux", "#SartorialEdge", "#TailoredLoose"],
    thumbs: [
      "https://images.unsplash.com/photo-1760890719879-9cbf3599d775?w=140&h=170&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1731598803141-f06f1fcf1121?w=140&h=170&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1769547673654-c67427ac94ff?w=140&h=170&fit=crop&auto=format",
    ],
    stat: "+18% this week",
  },
  {
    id: "nyc",
    slug: "new-york",
    name: "New York",
    country: "USA",
    x: 103,
    y: 55,
    neon: "#00c8ff",
    heat: 89,
    trend: "NYC Prep × Downtown Raw",
    tags: ["#NYCPrep", "#DowntownRaw", "#CanalStreet"],
    thumbs: [
      "https://images.unsplash.com/photo-1649114383220-c4f0f0dbafbe?w=140&h=170&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1498447817931-2edda1605b97?w=140&h=170&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1731598803141-f06f1fcf1121?w=140&h=170&fit=crop&auto=format",
    ],
    stat: "+15% this week",
  },
  {
    id: "london",
    slug: "london",
    name: "London",
    country: "UK",
    x: 172,
    y: 42,
    neon: "#ff6af0",
    heat: 85,
    trend: "Post-Punk × South Bank",
    tags: ["#PostPunk", "#SouthBank", "#ThriftLux"],
    thumbs: [
      "https://images.unsplash.com/photo-1490761622464-a51ba63053e7?w=140&h=170&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1594608979954-99483d3334ec?w=140&h=170&fit=crop&auto=format",
      "https://images.unsplash.com/photo-1760890719879-9cbf3599d775?w=140&h=170&fit=crop&auto=format",
    ],
    stat: "+12% this week",
  },
] as const;

export function getTrendCityExploreHref(city: TrendMapCity): string {
  const q = city.trend.replace(/\s×\s/g, " ");
  return `/search?q=${encodeURIComponent(q)}`;
}
