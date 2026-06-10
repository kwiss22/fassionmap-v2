"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AiArticlesSection,
  AiLookBriefSection,
  AiProductsSection,
} from "@/components/search/AiSearchSections";
import { AiRecommendedPrompts } from "@/components/search/AiRecommendedPrompts";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import type { AiRecommendedPrompt } from "@/lib/ai/recommended-prompts";
import type {
  AiLookBrief,
  AiContentArticle,
  AiSearchCuratedItem,
  LLMProviderName,
} from "@/lib/ai/types";
import { APP_MARKET } from "@/lib/market";

type AiSearchApiData = {
  summary: string;
  lookBrief: AiLookBrief;
  articles: AiContentArticle[];
  items: AiSearchCuratedItem[];
  provider: LLMProviderName;
};

type AiSearchApiResponse = {
  ok: boolean;
  cached?: boolean;
  data?: AiSearchApiData;
  error?: string;
};

type AiCuratePanelProps = {
  initialPrompt?: string;
  autoRun?: boolean;
};

export function AiCuratePanel({
  initialPrompt = "",
  autoRun = false,
}: AiCuratePanelProps) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const didAutoRun = useRef(false);
  const [lookBrief, setLookBrief] = useState<AiLookBrief | null>(null);
  const [articles, setArticles] = useState<AiContentArticle[]>([]);
  const [items, setItems] = useState<AiSearchCuratedItem[]>([]);
  const [provider, setProvider] = useState<LLMProviderName | null>(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [activeRecommendId, setActiveRecommendId] = useState<string | null>(
    null
  );

  const runCuration = useCallback(async (text: string, recommendId?: string) => {
    const query = text.trim();
    if (query.length < 2) {
      setError("Describe what you want in at least 2 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    setLookBrief(null);
    setArticles([]);
    setItems([]);
    setSubmitted(true);
    setActiveRecommendId(recommendId ?? null);

    try {
      const res = await fetch("/api/ai/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query, locale: APP_MARKET.locale }),
      });
      const json = (await res.json()) as AiSearchApiResponse;
      if (!res.ok || !json.ok || !json.data) {
        setError(
          json.error ??
            `AI curation error (${res.status}). Check LLM_PROVIDER and API keys in .env.local.`
        );
        return;
      }
      setLookBrief(json.data.lookBrief);
      setArticles(json.data.articles);
      setItems(json.data.items);
      setProvider(json.data.provider);
      setCached(!!json.cached);
    } catch {
      setError("Network error. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  const submit = useCallback(() => {
    setActiveRecommendId(null);
    void runCuration(prompt);
  }, [prompt, runCuration]);

  const onRecommendSelect = useCallback(
    (item: AiRecommendedPrompt) => {
      void runCuration(item.prompt, item.id);
    },
    [runCuration]
  );

  useEffect(() => {
    if (!autoRun || didAutoRun.current) return;
    const q = initialPrompt.trim();
    if (q.length < 2) return;
    didAutoRun.current = true;
    setPrompt(q);
    void runCuration(q);
  }, [autoRun, initialPrompt, runCuration]);

  const hasResults =
    lookBrief !== null || articles.length > 0 || items.length > 0;

  const showRecommendations = !loading && !hasResults;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-4 text-[var(--color-ai)]"
        >
          <SparklesIcon className="h-4 w-4" />
        </span>
        <textarea
          value={prompt}
          onChange={(e) => {
            setPrompt(e.target.value);
            setActiveRecommendId(null);
          }}
          rows={3}
          placeholder="e.g. 5'5 curvy, rainy-day office look, budget around $250"
          className="ai-search-field min-h-[96px] w-full resize-y py-3 pl-11 pr-4 text-[14px] placeholder:text-on-surface-variant"
          aria-label="AI curation request"
        />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => submit()}
        className="inline-flex h-12 w-full items-center justify-center bg-on-surface px-8 text-[12px] font-medium tracking-[0.22em] text-on-primary-container uppercase transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {loading ? "Curating…" : "Get curation"}
      </button>

      {showRecommendations ? (
        <AiRecommendedPrompts
          disabled={loading}
          activeId={activeRecommendId}
          onSelect={onRecommendSelect}
        />
      ) : null}

      {error ? (
        <p
          className="rounded-sm border border-error/40 bg-error-container px-4 py-6 text-center text-[13px] text-on-error-container"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="py-8 text-center text-[11px] tracking-[0.22em] text-on-surface-variant">
          Gathering coverage · summarizing · curating products…
        </p>
      ) : null}

      {!loading && hasResults ? (
        <div className="mt-10 flex flex-col gap-16 border-t border-outline-variant/25 pt-12 sm:-mx-8 sm:max-w-3xl md:-mx-12 lg:-mx-16 lg:max-w-4xl">
          {lookBrief ? <AiLookBriefSection brief={lookBrief} /> : null}
          <AiProductsSection items={items} />
          <AiArticlesSection articles={articles} />
        </div>
      ) : null}

      {!loading && !error && submitted && !hasResults ? (
        <p className="py-8 text-center text-[13px] text-on-surface-variant">
          No results yet. Try rephrasing your request.
        </p>
      ) : null}
    </div>
  );
}
