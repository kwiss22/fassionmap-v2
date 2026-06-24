"use client";

import { usePathname } from "next/navigation";
import { OnboardingRedirect } from "@/components/onboarding/OnboardingRedirect";
import { cn } from "@/lib/utils";
import { BottomNav } from "./BottomNav";

/**
 * 전역 셸 — Make v2.1처럼 flex column + BottomNav를 하단에 고정 배치.
 *
 * 모바일: 430px 캔버스, h-[100dvh] flex column
 * 데스크톱(lg+): BottomNav 숨김 → TopBar horizontal nav
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideBottomNav =
    pathname?.startsWith("/product") ||
    pathname?.startsWith("/onboarding") ||
    pathname?.startsWith("/checkout");
  const darkShell =
    pathname?.startsWith("/search") && pathname.includes("mode=ai");
  const isTabScreen =
    pathname === "/feed" ||
    pathname?.startsWith("/atlas") ||
    (pathname?.startsWith("/search") && pathname.includes("mode=ai"));

  return (
    <OnboardingRedirect>
      <div
        className={cn(
          "relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden sm:max-w-[720px] lg:h-auto lg:min-h-[100dvh] lg:max-w-none",
          darkShell ? "bg-[#060a08]" : "bg-surface"
        )}
      >
        <div
          className={cn(
            "min-h-0 flex-1",
            isTabScreen ? "overflow-hidden" : "overflow-y-auto",
            !hideBottomNav && !isTabScreen ? "pb-nav lg:pb-0" : ""
          )}
        >
          {children}
        </div>
        {!hideBottomNav && <BottomNav />}
      </div>
    </OnboardingRedirect>
  );
}
