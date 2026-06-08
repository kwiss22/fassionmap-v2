"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { HOME_AGENT_PROMPTS } from "@/lib/home-agent-prompts";

function buildAiSearchUrl(prompt: string) {
  const params = new URLSearchParams();
  params.set("mode", "ai");
  params.set("q", prompt.trim());
  return `/search?${params.toString()}`;
}

/**
 * 홈 Agent 입력 — before: 상단 검색창(브랜드·가격)
 * after: 대화형 프롬프트 + 예시 칩 → /search?mode=ai 로 전달
 */
export function AgentInputSection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");

  const submit = useCallback(
    (text: string) => {
      const q = text.trim();
      if (q.length < 2) return;
      router.push(buildAiSearchUrl(q));
    },
    [router]
  );

  return (
    <section
      id="styling-agent"
      className="scroll-mt-28 border-b border-outline-variant/60 px-5 py-10 lg:px-10 lg:py-12"
    >
      <p className="eyebrow">STYLE AGENT</p>
      <h2 className="editorial-display mt-2 text-[26px] leading-tight sm:text-[32px]">
        무엇을 입을지 <em className="italic">말해 보세요</em>
      </h2>
      <p className="mt-2 max-w-lg text-[13px] text-on-surface-variant">
        단순 검색이 아니라, 체형·상황·예산을 함께 적어 주시면 AI가 룩을
        제안합니다.
      </p>

      <div className="relative mt-6">
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-4 text-[var(--color-ai)]"
        >
          <SparklesIcon className="h-4 w-4" />
        </span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          placeholder="예: 165cm, 하체 통통, 서울 비 오는 날 출근룩 추천해줘"
          className="ai-search-field min-h-[100px] w-full resize-none py-3 pl-11 pr-4 text-[14px] placeholder:text-on-surface-variant"
          aria-label="스타일링 요청"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              submit(prompt);
            }
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => submit(prompt)}
        disabled={prompt.trim().length < 2}
        className="mt-4 h-11 w-full rounded-sm bg-[var(--color-ai)] text-[12px] font-medium tracking-[0.18em] text-white transition-opacity disabled:opacity-40 sm:w-auto sm:min-w-[200px] sm:px-8"
      >
        추천 받기
      </button>

      <div className="hide-scrollbar mt-5 -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
        {HOME_AGENT_PROMPTS.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className="chip-filter shrink-0 whitespace-nowrap text-left"
            onClick={() => {
              setPrompt(chip.prompt);
              submit(chip.prompt);
            }}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </section>
  );
}
