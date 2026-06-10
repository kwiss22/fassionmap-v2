"use client";

import Image from "next/image";
import Link from "next/link";
import type { AiContentArticle, AiLookBrief, AiSearchCuratedItem } from "@/lib/ai/types";
import { formatAmount, productDisplayCurrency } from "@/lib/price";
import { productDedupeKey, productToDetailHref } from "@/lib/product";
import { cn } from "@/lib/utils";

function SectionLabel({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-[11px] font-medium tracking-[0.24em] text-on-surface-variant",
        className
      )}
    >
      {children}
    </h3>
  );
}

function sourceLabel(source: AiContentArticle["source"]): string {
  return source === "news" ? "NEWS" : "BLOG";
}

export function AiArticlesSection({ articles }: { articles: AiContentArticle[] }) {
  if (articles.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2 border-t border-outline-variant/40 pt-8">
      <SectionLabel className="text-[10px] tracking-[0.2em] text-on-surface-variant/80">
        Related reads
      </SectionLabel>
      <p className="text-[10px] text-on-surface-variant/70">
        Some sources may be in Korean — especially for K-Fashion stories.
      </p>
      <ul className="mt-1 flex flex-col gap-2">
        {articles.map((article) => (
          <li key={article.link}>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block py-1"
            >
              <span className="text-[9px] tracking-[0.16em] text-on-surface-variant/80">
                {sourceLabel(article.source)}
                {article.pubDate ? ` · ${article.pubDate}` : ""}
              </span>
              <p className="mt-0.5 text-[12px] leading-snug text-on-surface-variant transition-colors group-hover:text-on-surface">
                {article.title}
              </p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function buildLookMeta(brief: AiLookBrief): string {
  const parts = [
    brief.whereFrom,
    brief.brandOrItem,
    brief.priceNote,
    brief.shoppingPriceRange,
  ].filter(Boolean);
  return parts.join(" · ");
}

export function AiLookBriefSection({ brief }: { brief: AiLookBrief }) {
  const meta = buildLookMeta(brief);

  return (
    <section className="flex flex-col gap-6 border-l-[3px] border-[var(--color-ai)]/30 pl-6 sm:gap-8 sm:pl-9">
      <p className="text-[10px] font-medium tracking-[0.26em] text-[var(--color-ai)] uppercase">
        Editor&apos;s note
      </p>
      <h3 className="editorial-display max-w-3xl text-[32px] leading-[1.08] text-on-surface sm:text-[40px] lg:text-[44px]">
        {brief.headline}
      </h3>
      <p className="max-w-2xl text-[15px] leading-[1.9] text-on-surface sm:text-[16px] sm:leading-[2]">
        {brief.editorialSummary}
      </p>
      {meta ? (
        <p className="max-w-2xl text-[11px] tracking-[0.12em] text-on-surface-variant/85">
          {meta}
        </p>
      ) : null}
    </section>
  );
}

function AiWhyBlock({ reason, size = "large" }: { reason: string; size?: "large" | "medium" }) {
  return (
    <blockquote
      className={cn(
        "border-l-2 border-[var(--color-ai)]/40 pl-5",
        size === "large" ? "sm:pl-6" : "pl-4"
      )}
    >
      <p className="text-[10px] font-medium tracking-[0.22em] text-[var(--color-ai)] uppercase">
        Why
      </p>
      <p
        className={cn(
          "mt-2 leading-snug text-on-surface",
          size === "large"
            ? "editorial-display text-[19px] sm:text-[22px]"
            : "text-[14px] leading-relaxed sm:text-[15px]"
        )}
      >
        {reason}
      </p>
    </blockquote>
  );
}

function AiCuratedPick({
  entry,
  priority = false,
  wide = true,
}: {
  entry: AiSearchCuratedItem;
  priority?: boolean;
  wide?: boolean;
}) {
  const { product } = entry;
  const href = productToDetailHref(product);
  const currency = productDisplayCurrency(product);
  const priceLabel = formatAmount(product.price, currency);

  if (wide) {
    return (
      <article className="flex flex-col gap-6 border-t border-outline-variant/25 py-10 first:border-t-0 first:pt-0">
        <AiWhyBlock reason={entry.reason} size="large" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-8 lg:gap-10">
          <Link
            href={href}
            className="silhouette-bg relative aspect-[4/5] w-full shrink-0 overflow-hidden sm:w-[200px] lg:w-[240px]"
            aria-label={product.name}
          >
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, 240px"
              priority={priority}
            />
          </Link>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 pt-1">
            {product.mallName ? (
              <p className="text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">
                {product.mallName}
              </p>
            ) : null}
            <Link
              href={href}
              className="text-[14px] leading-snug text-on-surface transition-colors hover:text-accent sm:text-[15px]"
            >
              {product.name}
            </Link>
            <p className="pt-1 text-[15px] font-medium tabular-nums text-on-surface">
              {priceLabel}
            </p>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full flex-col gap-4">
      <AiWhyBlock reason={entry.reason} size="medium" />
      <Link
        href={href}
        className="silhouette-bg relative mt-auto aspect-[4/5] w-full overflow-hidden"
        aria-label={product.name}
      >
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 50vw, 33vw"
          priority={priority}
        />
      </Link>
      <div className="space-y-1">
        <Link
          href={href}
          className="clamp-2 block text-[13px] leading-snug text-on-surface"
        >
          {product.name}
        </Link>
        <p className="text-[13px] font-medium tabular-nums text-on-surface">
          {priceLabel}
        </p>
      </div>
    </article>
  );
}

export function AiProductsSection({ items }: { items: AiSearchCuratedItem[] }) {
  if (items.length === 0) {
    return (
      <section className="flex flex-col gap-3">
        <SectionLabel>Curated picks</SectionLabel>
        <p className="py-6 text-center text-[13px] text-on-surface-variant">
          No matching products found.
        </p>
      </section>
    );
  }

  const useWideLayout = items.length <= 4;

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <SectionLabel>Curated picks</SectionLabel>
        <p className="text-[12px] text-on-surface-variant">
          Each piece chosen for a reason — not a keyword grid.
        </p>
      </div>

      {useWideLayout ? (
        <div className="flex flex-col">
          {items.map((entry, i) => (
            <AiCuratedPick
              key={productDedupeKey(entry.product)}
              entry={entry}
              priority={i === 0}
              wide
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12">
          {items.map((entry, i) => (
            <AiCuratedPick
              key={productDedupeKey(entry.product)}
              entry={entry}
              priority={i === 0}
              wide={false}
            />
          ))}
        </div>
      )}
    </section>
  );
}
