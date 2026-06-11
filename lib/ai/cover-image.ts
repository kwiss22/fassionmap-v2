/**
 * 검증된 커버 이미지 풀 — AI가 URL을 직접 만들지 않게 발행 시 여기서만 선택.
 */
export type CoverImageAsset = {
  coverImage: string;
  coverAlt: string;
  coverFocal: string;
};

const COVER_POOL: readonly CoverImageAsset[] = [
  {
    coverImage:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=85&w=1800",
    coverAlt: "Cashmere coat editorial — warm neutral tones.",
    coverFocal: "center 35%",
  },
  {
    coverImage:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=85&w=1800",
    coverAlt: "Editorial street style — structured outerwear.",
    coverFocal: "center 40%",
  },
  {
    coverImage:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=85&w=1800",
    coverAlt: "Minimal fashion portrait — quiet luxury mood.",
    coverFocal: "center 30%",
  },
  {
    coverImage:
      "https://images.unsplash.com/photo-1483985988350-763728e3685b?auto=format&fit=crop&q=85&w=1800",
    coverAlt: "Shopping district editorial — urban fashion week tone.",
    coverFocal: "center 45%",
  },
] as const;

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function pickCoverImage(seed: string): CoverImageAsset {
  const index = hashSeed(seed) % COVER_POOL.length;
  return COVER_POOL[index]!;
}
