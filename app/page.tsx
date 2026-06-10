"use client";

import { TopBar } from "@/components/layout/TopBar";
import { HomeHero } from "@/components/home/HomeHero";
import { RecommendedLooksSection } from "@/components/home/RecommendedLooksSection";
import { EditorialTeaserSection } from "@/components/home/EditorialTeaserSection";

/**
 * 홈 — AI 스타일링 1차 진입점.
 *
 * Before: HeroCover + Atlas + Ticker + 4 editorial sections + Brand index
 * After:  Hero (with AI input) + Recommended looks + Editorial teaser (minimal)
 *
 * Atlas / Maison / Brand index → /brands
 */
export default function Home() {
  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface pb-20">
      <TopBar showStatusStrip={false} />
      <HomeHero />
      <RecommendedLooksSection />
      <EditorialTeaserSection />
    </main>
  );
}
