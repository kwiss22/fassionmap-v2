"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AiArticlesSection,
  AiLookBriefSection,
  AiProductsSection,
} from "@/components/search/AiSearchSections";
import { AiRecommendedPrompts } from "@/components/search/AiRecommendedPrompts";
import { AIChip } from "@/components/ui/AIChip";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import type { AiRecommendedPrompt } from "@/lib/ai/recommended-prompts";
import type {
  AiLookBrief,
  AiContentArticle,
  AiSearchCuratedItem,
  LLMProviderName,
} from "@/lib/ai/types";

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
  /** URL ?q= 등 홈 Agent에서 넘어온 초기 프롬프트 */
  initialPrompt?: string;
  /** initialPrompt가 있으면 마운트 시 자동 큐레이션 */
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
      setError("2자 이상으로 무엇을 찾는지 적어 주세요.");
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
        body: JSON.stringify({ prompt: query }),
      });
      const json = (await res.json()) as AiSearchApiResponse;
      if (!res.ok || !json.ok || !json.data) {
        setError(
          json.error ??
            `AI 큐레이션 오류 (${res.status}). .env.local의 LLM_PROVIDER·API 키를 확인하세요.`
        );
        return;
      }
      setLookBrief(json.data.lookBrief);
      setArticles(json.data.articles);
      setItems(json.data.items);
      setProvider(json.data.provider);
      setCached(!!json.cached);
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
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
      // UX: 프리셋 클릭 시 화면이 상단 입력창으로 튀는 느낌을 줄이기 위해
      // textarea value는 그대로 두고, API 호출에만 해당 프롬프트를 사용한다.
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
      <header className="flex flex-col gap-2">
        <AIChip>AI 스타일링</AIChip>
        <p className="max-w-md text-[13px] leading-relaxed text-on-surface-variant">
          체형·일정·날씨·예산을 적어 주시면, 관련 이슈 요약과 함께 착장에 맞는
          쇼핑 아이템을 추천합니다.
        </p>
      </header>

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
          placeholder="예: 165cm 하체 통통, 비 오는 날 출근룩, 예산 30만 원대"
          className="ai-search-field min-h-[96px] w-full resize-y py-3 pl-11 pr-4 text-[14px] placeholder:text-on-surface-variant"
          aria-label="AI 큐레이션 요청"
        />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={() => submit()}
        className="h-11 w-full rounded-sm bg-[var(--color-ai)] text-[12px] font-medium tracking-[0.18em] text-white transition-opacity disabled:opacity-50"
      >
        {loading ? "큐레이션 중…" : "큐레이션 받기"}
      </button>

      {showRecommendations ? (
        <AiRecommendedPrompts
          disabled={loading}
          activeId={activeRecommendId}
          onSelect={onRecommendSelect}
        />
      ) : null}

      {provider && (
        <p className="text-[10px] tracking-[0.2em] text-on-surface-variant">
          Provider: {provider}
          {cached ? " · cached" : ""}
        </p>
      )}

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
          기사 수집 · 요약 · 쇼핑 큐레이션 중…
        </p>
      ) : null}

      {!loading && hasResults ? (
        <div className="flex flex-col gap-10">
          <AiArticlesSection articles={articles} />
          {lookBrief ? <AiLookBriefSection brief={lookBrief} /> : null}
          <AiProductsSection items={items} />
        </div>
      ) : null}

      {!loading && !error && submitted && !hasResults ? (
        <p className="py-8 text-center text-[13px] text-on-surface-variant">
          결과를 가져오지 못했습니다. 표현을 바꿔 다시 시도해 보세요.
        </p>
      ) : null}
    </div>
  );
}
