"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 모바일 한정 BottomNav.
 *
 * 변경 의도:
 *  - 데스크톱(lg+)에서는 TopBar의 horizontal nav가 1차 nav 책임을 지므로 hidden.
 *  - 가운데 floating FAB(검은 원 + 카메라 = AI 검색) 제거 → 검색은 TopBar로 이관.
 *    FAB은 instagram/배민/쿠팡 정확한 시그니처라 platform 톤과 충돌이 컸다.
 *  - 4탭 균등(`HOME / FEED / SAVED / ME`) — 균질한 hairline 그리드.
 *  - 활성 표시는 색이 아닌 상단 1px 라인으로 — 잡지의 page rule 느낌.
 */

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: readonly NavItem[] = [
  {
    href: "/",
    label: "HOME",
    icon: <HomeIcon />,
    match: (p) => p === "/",
  },
  {
    href: "/feed",
    label: "FEED",
    icon: <FeedIcon />,
    match: (p) => p.startsWith("/feed"),
  },
  {
    href: "/saved",
    label: "SAVED",
    icon: <BookmarkIcon />,
    match: (p) => p.startsWith("/saved"),
  },
  {
    href: "/me",
    label: "ME",
    icon: <UserIcon />,
    match: (p) => p.startsWith("/me"),
  },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Primary"
      className="bottom-nav fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-outline-variant bg-surface/95 backdrop-blur-md sm:max-w-[720px] lg:hidden"
    >
      <ul className="grid h-14 grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href} className="relative">
              {active && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-4 right-4 top-0 h-px bg-on-surface"
                />
              )}
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex h-full flex-col items-center justify-center gap-1 text-[10px] tracking-[0.22em] transition-colors " +
                  (active ? "text-on-surface" : "text-on-surface-variant")
                }
              >
                <span className="h-[20px]">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="17" height="14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3.5 12h17" stroke="currentColor" strokeWidth="1.4" />
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

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M4 20c1.5-3.5 4.5-5.5 8-5.5s6.5 2 8 5.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
