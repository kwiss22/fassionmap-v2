"use client";

import { ProductCard } from "@/components/ProductCard";
import type { AiContentArticle, AiLookBrief, AiSearchCuratedItem } from "@/lib/ai/types";
import { productDedupeKey } from "@/lib/product";

function SectionLabel({ children }: { children: string }) {
  return (
    <h3 className="text-[11px] font-medium tracking-[0.24em] text-on-surface-variant">
      {children}
    </h3>
  );
}

function sourceLabel(source: AiContentArticle["source"]): string {
  return source === "news" ? "NEWS" : "BLOG";
}

export function AiArticlesSection({ articles }: { articles: AiContentArticle[] }) {
  if (articles.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <SectionLabel>관련 기사 · 콘텐츠</SectionLabel>
        <p className="text-[13px] text-on-surface-variant">
          관련 뉴스·블로그를 찾지 못했습니다. 표현을 바꿔 다시 검색해 보세요.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>관련 기사 · 콘텐츠</SectionLabel>
      <ul className="flex flex-col gap-2">
        {articles.map((article) => (
          <li key={article.link}>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-sm border border-outline-variant bg-surface-bright px-4 py-3 transition-colors hover:border-[var(--color-ai-bright)]/40"
            >
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[9px] tracking-[0.2em] text-[var(--color-ai)]">
                  {sourceLabel(article.source)}
                </span>
                {article.pubDate ? (
                  <span className="text-[10px] text-on-surface-variant">
                    {article.pubDate}
                  </span>
                ) : null}
              </div>
              <p className="text-[14px] font-medium leading-snug text-on-surface group-hover:text-[var(--color-ai)]">
                {article.title}
              </p>
              {article.description ? (
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-on-surface-variant">
                  {article.description}
                </p>
              ) : null}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function AiLookBriefSection({ brief }: { brief: AiLookBrief }) {
  const rows: { label: string; value: string }[] = [
    { label: "어디", value: brief.whereFrom },
    { label: "브랜드·아이템", value: brief.brandOrItem },
    { label: "가격", value: brief.priceNote },
  ];
  if (brief.shoppingPriceRange) {
    rows.push({ label: "쇼핑 유사품", value: brief.shoppingPriceRange });
  }

  return (
    <section className="flex flex-col gap-3">
      <SectionLabel>착장 요약</SectionLabel>
      <div className="rounded-sm border border-outline-variant bg-surface-bright px-4 py-4">
        <p className="text-[15px] font-medium leading-snug text-on-surface">
          {brief.headline}
        </p>
        <dl className="mt-4 flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[5.5rem_1fr] gap-2 text-[12px]">
              <dt className="tracking-[0.12em] text-on-surface-variant">{row.label}</dt>
              <dd className="leading-relaxed text-on-surface">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 border-t border-outline-variant/80 pt-4 text-[13px] leading-relaxed text-on-surface-variant">
          {brief.editorialSummary}
        </p>
      </div>
    </section>
  );
}

export function AiProductsSection({ items }: { items: AiSearchCuratedItem[] }) {
  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <SectionLabel>쇼핑 추천</SectionLabel>
        <p className="py-6 text-center text-[13px] text-on-surface-variant">
          조건에 맞는 상품을 찾지 못했습니다.
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <SectionLabel>쇼핑 추천</SectionLabel>
      <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((entry, i) => (
          <div key={productDedupeKey(entry.product)} className="flex flex-col gap-3">
            <ProductCard product={entry.product} priority={i === 0} />
            <p className="text-[12px] leading-relaxed text-on-surface-variant">
              <span className="font-medium text-[var(--color-ai)]">추천</span>{" "}
              {entry.reason}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
