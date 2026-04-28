import Image from "next/image";
import Link from "next/link";
import { type EditorialIssue } from "@/lib/editorial";

/**
 * 풀-블리드 매거진 커버.
 *
 * 디자인 의도:
 *  - 이미지가 주인공이고 타이포는 그 위에 얹힌다 (Vogue / Document Journal / Numéro 패턴).
 *  - 좌우 여백을 끝까지 끌어 0으로 — 잡지 표지의 bleed 효과.
 *  - 모바일은 세로 표지 비율(3:4), 데스크톱은 시네마틱 가로(16:9).
 *  - CTA는 pill이 아니라 sharp underline / hairline border (0px radius 시스템과 일치).
 *  - 이미지 상단/하단에 매우 약한 그라디언트 — 텍스트 가독성만 살짝 보강.
 */
export function HeroCover({ issue }: { issue: EditorialIssue }) {
  const {
    title,
    titleHighlight,
    coverImage,
    coverAlt,
    coverFocal = "center",
  } = issue;

  return (
    <section className="relative">
      {/* Cover frame */}
      <div className="relative w-full aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9] overflow-hidden bg-on-surface">
        <Image
          src={coverImage}
          alt={coverAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: coverFocal }}
        />

        {/* Top-edge gradient — header 가독성 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/45 via-black/15 to-transparent"
        />
        {/* Bottom-edge gradient — title 가독성 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 via-black/25 to-transparent"
        />

        {/* Top metadata strip */}
        <header className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-5 sm:px-8 sm:pt-7 text-[10px] sm:text-[11px] tracking-[0.28em] text-white/95">
          <span>
            VOL. {issue.vol} &nbsp;·&nbsp; {issue.season}
          </span>
          <span className="hidden sm:inline text-white/70">GLOBAL EDIT</span>
        </header>

        {/* Right-edge corner: city + date — 매거진 spine 표기 인스피레이션 */}
        <div className="absolute right-5 sm:right-8 top-12 sm:top-16 text-right text-[10px] sm:text-[11px] tracking-[0.28em] text-white/75">
          <div>{issue.city}</div>
          <div className="mt-1">{issue.date}</div>
        </div>

        {/* Headline overlay — bottom-left */}
        <div className="absolute inset-x-0 bottom-0 px-5 pb-7 sm:px-8 sm:pb-10 lg:px-12 lg:pb-14">
          <span className="eyebrow-bold text-white/85">
            {issue.coverLabel}
          </span>
          <h1
            className="editorial-display mt-3 text-white text-[44px] leading-[0.92] sm:text-[64px] lg:text-[88px] xl:text-[104px] max-w-[18ch]"
            style={{ textShadow: "0 1px 32px rgba(0,0,0,0.35)" }}
          >
            {renderTitleWithHighlight(title, titleHighlight)}
          </h1>
        </div>
      </div>

      {/* Below-the-fold strip: dek + sharp CTAs.
         이미지에서 떨어뜨려 본문 톤(아이보리)으로 받아주면, 시선이 자연스레
         "표지 → 컨텐츠"로 흐른다. */}
      <div className="border-b border-outline-variant/70 px-5 py-7 sm:px-8 sm:py-9 lg:px-12 lg:flex lg:items-end lg:justify-between lg:gap-10">
        <p className="max-w-[44ch] text-[13px] sm:text-[14px] leading-relaxed text-on-surface">
          {issue.dek}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 lg:mt-0 lg:flex-nowrap lg:shrink-0">
          <Link
            href={issue.primaryCtaHref}
            className="inline-flex items-center gap-3 border border-on-surface bg-on-surface px-6 py-3 text-[11px] font-semibold tracking-[0.22em] text-on-primary transition-colors hover:bg-transparent hover:text-on-surface"
          >
            {issue.primaryCtaLabel}
            <span aria-hidden>→</span>
          </Link>
          <Link
            href={issue.secondaryCtaHref}
            className="underline-link inline-flex items-center text-[11px] font-semibold tracking-[0.22em] text-on-surface"
            data-active="false"
          >
            {issue.secondaryCtaLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}

function renderTitleWithHighlight(title: string, highlight?: string) {
  if (!highlight) return title;
  const idx = title.indexOf(highlight);
  if (idx < 0) return title;
  const before = title.slice(0, idx);
  const after = title.slice(idx + highlight.length);
  return (
    <>
      {before}
      <em className="italic">{highlight}</em>
      {after}
    </>
  );
}
