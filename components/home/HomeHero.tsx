"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AIChip } from "@/components/ui/AIChip";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { HOME_AGENT_PROMPTS } from "@/lib/home-agent-prompts";
import { cn } from "@/lib/utils";

/** Replace with your asset at `public/hero.jpg`. */
const HERO_IMAGE = "/hero.jpg";

function buildAiSearchUrl(prompt: string) {
  const params = new URLSearchParams();
  params.set("mode", "ai");
  params.set("q", prompt.trim());
  return `/search?${params.toString()}`;
}

function HeroLookImage({
  priority,
  className,
}: {
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {failed ? (
        <div
          className="silhouette-bg absolute inset-0"
          role="img"
          aria-label="Editorial look placeholder"
        />
      ) : (
        <Image
          src={HERO_IMAGE}
          alt="Editorial look — Fashionmap cover"
          fill
          priority={priority}
          sizes="(max-width: 1024px) 100vw, 58vw"
          className="object-cover object-center"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

/**
 * 홈 Hero — 매거진 커버 + AI 프롬프트 입력.
 * 모바일: 풀블리드 이미지 → 텍스트 / 데스크톱: 5:7 비대칭 2단.
 */
export function HomeHero() {
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
    <section className="lg:grid lg:grid-cols-12 lg:items-stretch lg:gap-x-10 lg:px-10 lg:py-24">
      {/* Look image — mobile top stack; desktop right 7 cols */}
      <div className="relative aspect-[3/4] w-full lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:aspect-[4/5] lg:min-h-[min(85vh,720px)]">
        <HeroLookImage priority />
      </div>

      {/* Copy + input — desktop left 5 cols */}
      <div className="flex flex-col justify-center px-5 py-10 lg:col-span-5 lg:col-start-1 lg:row-start-1 lg:px-0 lg:py-0">
        <AIChip>AI Styling</AIChip>
        <h1 className="editorial-display mt-5 max-w-xl text-[34px] leading-[1.06] sm:text-[44px] lg:text-[52px]">
          What to wear today,
          <br />
          <span className="italic">picked by AI.</span>
        </h1>
        <p className="mt-4 max-w-md text-[14px] leading-relaxed text-on-surface-variant">
          Personal style recommendations shaped by your body, schedule, weather,
          and budget.
          <span className="hidden sm:inline">
            {" "}
            Quiet luxury tone — recommendations first on home.
          </span>
        </p>

        <div className="relative mt-8">
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
            placeholder="e.g. 5'5 curvy, rainy-day office look, budget around $250"
            className="ai-search-field min-h-[100px] w-full resize-none py-3 pl-11 pr-4 text-[14px] placeholder:text-on-surface-variant"
            aria-label="Styling request"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                submit(prompt);
              }
            }}
          />
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => submit(prompt)}
            disabled={prompt.trim().length < 2}
            className="inline-flex h-12 items-center justify-center bg-on-surface px-8 text-[12px] font-medium tracking-[0.22em] text-on-primary-container uppercase transition-opacity hover:opacity-90 disabled:opacity-40 sm:min-w-[200px]"
          >
            Get curation
          </button>
          <Link
            href="/saved?tab=looks"
            className="inline-flex h-12 items-center justify-center border border-outline-variant px-6 text-[12px] font-medium tracking-[0.2em] text-on-surface uppercase transition-colors hover:border-on-surface"
          >
            Saved looks
          </Link>
        </div>

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
      </div>
    </section>
  );
}
