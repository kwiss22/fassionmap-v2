"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSaved } from "@/lib/hooks/use-saved";
import { SparklesIcon } from "@/components/ui/SparklesIcon";
import { TickerBar } from "@/components/home/TickerBar";
import { StatusStrip } from "./StatusStrip";
import { cn } from "@/lib/utils";

type TopBarProps = {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  right?: React.ReactNode;
  showStatusStrip?: boolean;
  tickerItems?: readonly string[];
  /** Atlas / dark UI pages */
  variant?: "light" | "dark";
};

export function TopBar({
  title,
  showBack,
  backHref,
  right,
  showStatusStrip = true,
  tickerItems,
  variant = "light",
}: TopBarProps) {
  const pathname = usePathname() ?? "/";
  const back = backHref ?? (showBack ? "/feed" : undefined);
  const dark = variant === "dark";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b backdrop-blur-md",
        dark
          ? "border-[rgba(57,255,122,0.08)] bg-[#060a08]/95 text-[#e8f0eb]"
          : "border-outline-variant/70 bg-surface/95 text-on-surface"
      )}
    >
      <div className="relative flex h-14 items-center justify-between px-5 lg:h-16 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-8 lg:flex-initial">
          {back ? (
            <Link
              href={back}
              aria-label="Go back"
              className="-ml-1 flex h-8 w-8 items-center justify-center"
            >
              <BackIcon dark={dark} />
            </Link>
          ) : (
            <Wordmark dark={dark} />
          )}

          {!back && (
            <nav
              aria-label="Primary"
              className="hidden items-center gap-7 font-mono text-[10px] font-medium tracking-[0.18em] lg:flex"
            >
              {DESKTOP_NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "underline-link uppercase transition-colors",
                      active
                        ? dark
                          ? "text-[var(--color-neon)]"
                          : "text-on-surface"
                        : dark
                          ? "text-[#2a4030] hover:text-[#e8f0eb]"
                          : "text-on-surface-variant hover:text-on-surface"
                    )}
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

        {title && (
          <h1 className="absolute left-1/2 -translate-x-1/2 font-body text-[15px] font-medium lg:static lg:translate-x-0">
            {title}
          </h1>
        )}

        <div className="flex min-w-0 items-center justify-end gap-3 text-inherit lg:flex-initial">
          {right ?? <DefaultActions dark={dark} />}
        </div>
      </div>

      {showStatusStrip &&
        (tickerItems && tickerItems.length > 0 ? (
          <TickerBar items={tickerItems} />
        ) : (
          <StatusStrip dark={dark} />
        ))}
    </header>
  );
}

function Wordmark({ dark }: { dark?: boolean }) {
  return (
    <Link
      href="/feed"
      aria-label="Home"
      className={cn(
        "font-playfair text-[18px] leading-none tracking-tight lg:text-[20px]",
        dark ? "text-[#e8f0eb]" : "text-on-surface"
      )}
    >
      Fassion<em className="not-italic font-semibold">map</em>
    </Link>
  );
}

function DefaultActions({ dark }: { dark?: boolean }) {
  const pathname = usePathname() ?? "/";
  const { items: saved } = useSaved();
  const onSearchPage = pathname.startsWith("/search");

  return (
    <>
      {!onSearchPage ? (
        <>
          <Link
            href="/search?mode=curate"
            aria-label="Search with AI"
            className={cn(
              "ai-search-trigger hidden h-9 min-w-[17rem] max-w-md flex-1 items-center gap-2.5 px-3.5 text-[12px] lg:flex",
              dark ? "border-[rgba(57,255,122,0.15)] bg-[#0d1410] text-[#e8f0eb]" : ""
            )}
          >
            <SparklesIcon className="h-[18px] w-[18px] shrink-0 text-[var(--color-lime)]" />
            <span className="flex-1 truncate text-left text-on-surface-variant">
              Ask AI what to wear…
            </span>
          </Link>

          <Link
            href="/search?mode=curate"
            aria-label="Search with AI"
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border lg:hidden",
              dark
                ? "border-[rgba(57,255,122,0.25)] bg-[rgba(57,255,122,0.1)] text-[var(--color-neon)]"
                : "border-[rgba(184,255,46,0.35)] bg-[rgba(184,255,46,0.08)] text-[var(--color-lime)]"
            )}
          >
            <SparklesIcon className="h-[18px] w-[18px]" />
          </Link>
        </>
      ) : null}

      <Link
        href="/saved"
        aria-label={`Saved ${saved.length} items`}
        className="hidden items-center gap-1.5 font-mono text-[10px] font-medium tracking-[0.18em] uppercase lg:inline-flex"
      >
        Saved
        <span className="tabular-nums text-on-surface-variant">{saved.length}</span>
      </Link>
      <Link
        href="/saved"
        aria-label={`Saved ${saved.length} items`}
        className="relative flex h-8 w-8 items-center justify-center lg:hidden"
      >
        <BookmarkIcon />
        {saved.length > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--color-lime)] px-1 font-mono text-[9px] font-bold leading-none text-ink">
            {saved.length > 99 ? "99+" : saved.length}
          </span>
        )}
      </Link>

      <Link
        href="/me"
        aria-label="My account"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-lg font-mono text-[10px] font-medium tracking-[0.14em]",
          dark
            ? "border border-[rgba(57,255,122,0.2)] text-[#e8f0eb]"
            : "border border-on-surface bg-on-surface text-on-primary-container"
        )}
      >
        MY
      </Link>
    </>
  );
}

const DESKTOP_NAV: {
  href: string;
  label: string;
  match: (p: string) => boolean;
}[] = [
  { href: "/feed", label: "Home", match: (p) => p === "/feed" || p.startsWith("/feed/") },
  { href: "/atlas-preview", label: "Atlas", match: (p) => p.startsWith("/atlas") },
  {
    href: "/search?mode=ai",
    label: "Style Lab",
    match: (p) => p.startsWith("/search") && p.includes("mode=ai"),
  },
  {
    href: "/search?mode=curate",
    label: "Curate",
    match: (p) => p.startsWith("/search") && p.includes("mode=curate"),
  },
  { href: "/saved", label: "Saved", match: (p) => p.startsWith("/saved") },
];

function BackIcon({ dark }: { dark?: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5l-7 7 7 7"
        stroke={dark ? "#39ff7a" : "currentColor"}
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
