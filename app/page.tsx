"use client";

import { TopBar } from "@/components/layout/TopBar";
import { HeroCover } from "@/components/home/HeroCover";
import { AtlasSection } from "@/components/atlas/AtlasSection";
import { TickerBar } from "@/components/home/TickerBar";
import { EditorialSection } from "@/components/home/EditorialSection";
import { BrandIndex } from "@/components/home/BrandIndex";
import { CURRENT_ISSUE } from "@/lib/editorial";
import { useHomeFeed } from "@/lib/hooks/use-home-feed";

export default function Home() {
  const { sections } = useHomeFeed();

  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      <TopBar />
      <HeroCover issue={CURRENT_ISSUE} />

      <AtlasSection />

      <TickerBar items={CURRENT_ISSUE.tickerItems} />

      {sections.map(({ section, items, loading }) => (
        <EditorialSection
          key={section.id}
          sectionId={section.id}
          eyebrow={section.eyebrow}
          title={section.title}
          titleHighlight={section.titleHighlight}
          subtitle={section.subtitle}
          viewAllHref={section.viewAllHref}
          items={items}
          loading={loading}
          isAi={section.source.type === "saved-ai"}
        />
      ))}

      <section className="border-t border-outline-variant/70 px-5 py-10">
        <p className="eyebrow">BRAND INDEX</p>
        <h2 className="editorial-display mt-2 text-[32px]">
          The <em>index</em>
        </h2>
        <p className="mt-2 text-[13px] text-on-surface-variant">
          52개 큐레이션 브랜드. 스크롤하여 이어 보기.
        </p>
      </section>
      <BrandIndex />
    </main>
  );
}
