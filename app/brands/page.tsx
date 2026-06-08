"use client";

import Link from "next/link";
import { TopBar } from "@/components/layout/TopBar";
import { AtlasSection } from "@/components/atlas/AtlasSection";
import { EditorialSection } from "@/components/home/EditorialSection";
import { BrandIndex } from "@/components/home/BrandIndex";
import { useHomeFeed } from "@/lib/hooks/use-home-feed";

/**
 * Brands — 홈에서 분리한 2뎁스 큐레이션.
 * Global atlas, Maison spotlight, Editor's edit, Brand index.
 */
export default function BrandsPage() {
  const { sections } = useHomeFeed();
  const editorialSections = sections.filter(
    (s) => s.section.source.type !== "saved-ai"
  );

  return (
    <main className="min-h-[100dvh] bg-surface pb-20 text-on-surface">
      <TopBar title="Brands" showStatusStrip={false} />

      <section className="px-5 pb-2 pt-8 lg:px-10 lg:pt-10">
        <p className="eyebrow">BRANDS · EDITORIAL</p>
        <h1 className="editorial-display mt-2 text-[32px] leading-tight lg:text-[40px]">
          Where fashion <em className="italic">lives</em>
        </h1>
        <p className="mt-3 max-w-lg text-[13px] text-on-surface-variant">
          52개 메종, 글로벌 atlas, 에디터 픽. 홈에서는 스타일 추천에 집중하고,
          브랜드 세계관은 여기서 탐색합니다.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block text-[11px] tracking-[0.2em] text-on-surface-variant uppercase underline-link"
        >
          ← AI 스타일링 홈
        </Link>
      </section>

      <AtlasSection />

      {editorialSections.map(({ section, items, loading }) => (
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
        />
      ))}

      <section className="border-t border-outline-variant/70 px-5 py-10 lg:px-10">
        <p className="eyebrow">BRAND INDEX</p>
        <h2 className="editorial-display mt-2 text-[32px]">
          The <em>index</em>
        </h2>
        <p className="mt-2 text-[13px] text-on-surface-variant">
          52개 큐레이션 브랜드.
        </p>
      </section>
      <BrandIndex />
    </main>
  );
}
