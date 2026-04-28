"use client";

import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { HeroCover } from "@/components/home/HeroCover";
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

      {/* 임시 미리보기 진입점 — Atlas 섹션 본 통합 시 제거 */}
      <Link
        href="/atlas-preview"
        className="group flex items-center justify-between gap-4 border-y border-outline-variant bg-surface-bright/40 px-5 py-3 transition-colors hover:bg-surface-bright lg:px-10"
      >
        <span className="flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase">
          <span className="border border-on-surface px-1.5 py-0.5 font-medium">
            Preview
          </span>
          <span className="text-on-surface-variant">The&nbsp;Atlas</span>
          <span className="hidden text-on-surface sm:inline">
            — Where fashion is being made.
          </span>
        </span>
        <span className="text-[12px] tracking-[0.2em] uppercase transition-transform group-hover:translate-x-1">
          View &rarr;
        </span>
      </Link>

      <TickerBar items={CURRENT_ISSUE.tickerItems} />

      {sections.map(({ section, items, loading }) => (
        <EditorialSection
          key={section.id}
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
