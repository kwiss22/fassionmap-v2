"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AIChip } from "@/components/ui/AIChip";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { HOME_AGENT_PROMPTS } from "@/lib/home-agent-prompts";
import { useNaverProducts } from "@/lib/hooks/use-naver-products";
import { cn } from "@/lib/utils";

const HERO_FALLBACK = "/hero.png";
const HERO_QUERIES = ["캐시미어 코트", "여성 코트", "women coat"] as const;

function buildAiSearchUrl(prompt: string) {
  const params = new URLSearchParams();
  params.set("mode", "curate");
  params.set("q", prompt.trim());
  return `/search?${params.toString()}`;
}

function HeroLookImage({
  src,
  alt,
  priority,
  className,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = failed ? HERO_FALLBACK : src;

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      <Image
        key={imageSrc}
        src={imageSrc}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 58vw"
        className="object-cover object-center"
        onError={() => setFailed(true)}
      />
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
  const { items } = useNaverProducts(HERO_QUERIES, { take: 1, display: 24 });
  const heroProduct = items[0];
  const heroSrc = heroProduct?.imageUrl ?? HERO_FALLBACK;
  const heroAlt = heroProduct?.name ?? "AI curation board — items to styled looks";

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
      {/* Look image — intrinsic 1024×793; desktop 7 cols */}
      <div className="relative aspect-[1024/793] w-full lg:col-span-7 lg:col-start-6 lg:row-start-1">
        <HeroLookImage src={heroSrc} alt={heroAlt} priority />
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
            className="relative inline-flex h-12 items-center justify-center overflow-hidden rounded-[14px] bg-on-surface px-8 font-body text-[14px] font-semibold text-on-primary-container transition-opacity hover:opacity-90 disabled:opacity-40 sm:min-w-[200px]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-l from-[rgba(184,255,46,0.12)] to-transparent"
            />
            Get curation
          </button>
          <Link
            href="/saved?tab=looks"
            className="inline-flex h-12 items-center justify-center rounded-[14px] border border-outline-variant px-6 font-body text-[12px] font-medium tracking-[0.12em] text-on-surface uppercase transition-colors hover:border-on-surface"
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
