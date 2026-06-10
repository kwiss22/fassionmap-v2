"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/lib/hooks/use-saved";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { TickerBar } from "@/components/home/TickerBar";
import { StatusStrip } from "./StatusStrip";

type TopBarProps = {
  /** 제목 중앙 정렬이 필요한 서브페이지(예: Saved) 용. */
  title?: string;
  /** 뒤로가기 노출. `backHref`가 있으면 자동으로 true. */
  showBack?: boolean;
  /** 뒤로가기 링크 목적지 (기본: "/"). 지정 시 showBack을 암시. */
  backHref?: string;
  /** 우측 커스텀 액션 슬롯 — 지정 시 기본 액션 대체 */
  right?: React.ReactNode;
  /**
   * 발행 신호(VOL / NEW / SAVED count) strip 노출 여부.
   * 기본: 홈 / 피드 같은 1차 페이지에서만 true 권장.
   * 서브페이지에서는 페이지 자체 정보에 집중하기 위해 끌 수 있다.
   */
  showStatusStrip?: boolean;
  /** 지정 시 StatusStrip 대신 TickerBar만 노출 (동시에 둘 다 쓰지 않음). */
  tickerItems?: readonly string[];
};

/**
 * 글로벌 TopBar — Editorial publication + Luxury commerce 절충 톤.
 *
 * 구조:
 *  - 모바일: 좌(워드마크 or 뒤로가기) / 가운데 제목(옵션) / 우(검색 트리거 + ME)
 *  - 데스크톱(lg+): 같은 줄에 horizontal nav(EDITORIAL / BRANDS / FOLLOWING / SAVED)와
 *    persistent search input이 함께 노출 — SSENSE / MR PORTER / 29CM의 platform shell.
 *
 * 의도:
 *  - 동그라미 컬러 로고 ☓ 워드마크만 (쇼핑몰 헤더 시그니처를 제거)
 *  - 가방/저장/검색 3종 아이콘 ☓ saved 카운트(텍스트) + ME만
 *  - 데스크톱에서 BottomNav가 사라지므로 nav 책임을 TopBar가 진다
 */
export function TopBar({
  title,
  showBack,
  backHref,
  right,
  showStatusStrip = true,
  tickerItems,
}: TopBarProps) {
  const pathname = usePathname() ?? "/";
  const back = backHref ?? (showBack ? "/" : undefined);

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/70 bg-surface/90 backdrop-blur-md">
      <div className="relative flex h-14 items-center justify-between px-5 lg:h-16 lg:px-8">
        {/* Left: 뒤로가기 또는 워드마크 */}
        <div className="flex min-w-0 flex-1 items-center gap-8 lg:flex-initial">
          {back ? (
            <Link
              href={back}
              aria-label="Go back"
              className="-ml-1 flex h-8 w-8 items-center justify-center"
            >
              <BackIcon />
            </Link>
          ) : (
            <Wordmark />
          )}

          {/* Desktop horizontal nav — lg+ 에서만 노출 */}
          {!back && (
            <nav
              aria-label="Primary"
              className="hidden items-center gap-7 text-[11px] font-medium tracking-[0.22em] lg:flex"
            >
              {DESKTOP_NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={
                      "underline-link uppercase " +
                      (active
                        ? "text-on-surface"
                        : "text-on-surface-variant hover:text-on-surface")
                    }
                    data-active={active ? "true" : undefined}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {/* Center: 서브페이지 제목 */}
        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 text-[15px] font-medium lg:static lg:translate-x-0">
            {title}
          </h1>
        )}

        {/* Right */}
        <div className="flex min-w-0 items-center justify-end gap-4 text-on-surface lg:flex-initial">
          {right ?? <DefaultActions />}
        </div>
      </div>

      {showStatusStrip &&
        (tickerItems && tickerItems.length > 0 ? (
          <TickerBar items={tickerItems} />
        ) : (
          <StatusStrip />
        ))}
    </header>
  );
}

function Wordmark() {
  return (
    <Link
      href="/"
      aria-label="Home"
      className="font-playfair text-[18px] leading-none tracking-tight text-on-surface lg:text-[20px]"
    >
      Fashion<em className="not-italic font-semibold">map</em>
    </Link>
  );
}

function DefaultActions() {
  const pathname = usePathname() ?? "/";
  const { items: saved } = useSaved();
  const onSearchPage = pathname.startsWith("/search");

  return (
    <>
      {!onSearchPage ? (
        <>
          {/* Desktop persistent search — ⌘K 단축키 컨벤션을 시각적으로 차용 */}
          <Link
            href="/search?mode=ai"
            aria-label="Search with AI"
            className="ai-search-trigger hidden h-9 min-w-[17rem] max-w-md flex-1 items-center gap-2.5 px-3.5 text-[12px] text-on-surface transition-colors hover:text-on-surface lg:flex"
          >
            <SparklesIcon className="h-[18px] w-[18px] shrink-0 text-[var(--color-ai-bright)]" />
            <span className="flex-1 truncate text-left text-on-surface-variant">
              Ask AI what to wear today…
            </span>
            <kbd className="ml-auto hidden shrink-0 items-center px-1.5 font-sans text-[10px] font-medium tracking-[0.14em] text-[var(--color-ai)]/80 sm:inline-flex">
              ⌘K
            </kbd>
          </Link>

          {/* Mobile — 검색 진입 */}
          <Link
            href="/search?mode=ai"
            aria-label="Search with AI"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-indigo-200/70 bg-gradient-to-br from-surface-bright to-[var(--color-ai-surface)] text-[var(--color-ai)] shadow-[0_2px_10px_rgba(49,46,129,0.12)] transition-transform active:scale-95 lg:hidden"
          >
            <SparklesIcon className="h-[18px] w-[18px]" />
          </Link>
        </>
      ) : null}

      {/* SAVED — 데스크톱은 텍스트, 모바일은 아이콘 */}
      <Link
        href="/saved"
        aria-label={`Saved ${saved.length} items`}
        className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-medium tracking-[0.22em] text-on-surface uppercase"
      >
        Saved
        <span className="tabular-nums text-on-surface-variant">
          {saved.length}
        </span>
      </Link>
      <Link
        href="/saved"
        aria-label={`Saved ${saved.length} items`}
        className="relative flex h-8 w-8 items-center justify-center lg:hidden"
      >
        <BookmarkIcon />
        {saved.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-semibold leading-none text-white">
            {saved.length > 99 ? "99+" : saved.length}
          </span>
        )}
      </Link>

      {/* My */}
      <Link
        href="/me"
        aria-label="My account"
        className="flex h-8 w-8 items-center justify-center border border-on-surface text-[11px] font-medium tracking-[0.22em]"
      >
        MY
      </Link>
    </>
  );
}

const DESKTOP_NAV: { href: string; label: string; match: (p: string) => boolean }[] = [
  {
    href: "/",
    label: "Home",
    match: (p) => p === "/",
  },
  {
    href: "/feed",
    label: "Feed",
    match: (p) => p.startsWith("/feed"),
  },
  {
    href: "/brands",
    label: "Brands",
    match: (p) => p.startsWith("/brands"),
  },
  {
    href: "/saved",
    label: "Saved",
    match: (p) => p.startsWith("/saved"),
  },
  {
    href: "/me",
    label: "My",
    match: (p) => p.startsWith("/me"),
  },
];

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3.5h12v17l-6-4-6 4v-17Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
