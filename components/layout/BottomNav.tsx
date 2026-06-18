"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  match: (pathname: string) => boolean;
};

const NAV_ITEMS: readonly NavItem[] = [
  { href: "/", label: "Home", icon: <HomeIcon />, match: (p) => p === "/" },
  {
    href: "/atlas-preview",
    label: "Atlas",
    icon: <GlobeIcon />,
    match: (p) => p.startsWith("/atlas"),
  },
  {
    href: "/search?mode=ai",
    label: "Style Lab",
    icon: <FlaskIcon />,
    match: (p) => p.startsWith("/search") && p.includes("mode=ai"),
  },
  { href: "/me", label: "Profile", icon: <UserIcon />, match: (p) => p.startsWith("/me") },
];

export function BottomNav() {
  const pathname = usePathname() ?? "/";
  const dark =
    pathname.startsWith("/atlas") ||
    (pathname.startsWith("/search") && pathname.includes("mode=ai"));

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "bottom-nav fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t backdrop-blur-md sm:max-w-[720px] lg:hidden",
        dark
          ? "border-[rgba(57,255,122,0.08)] bg-[rgba(6,10,8,0.97)]"
          : "border-outline-variant bg-surface/95"
      )}
    >
      <ul className="grid h-[3.75rem] grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 font-mono text-[8px] tracking-[0.1em] uppercase transition-colors",
                  !active && (dark ? "text-[#1e3022]" : "text-on-surface-variant"),
                  active && !dark && "text-on-surface",
                  active && dark && "text-[var(--color-neon)]"
                )}
              >
                <span
                  className={cn(
                    "flex h-[30px] w-[38px] items-center justify-center rounded-[10px] transition-colors",
                    active &&
                      (dark
                        ? "border border-[rgba(57,255,122,0.2)] bg-[rgba(57,255,122,0.12)]"
                        : "bg-on-surface text-on-primary-container")
                  )}
                >
                  {item.icon}
                </span>
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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M3 12h18M12 3c2.5 2.8 2.5 14.2 0 18M12 3c-2.5 2.8-2.5 14.2 0 18"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 3h6M10 3v6.5L4.5 19a2 2 0 0 0 1.7 3h11.8a2 2 0 0 0 1.7-3L14 9.5V3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
