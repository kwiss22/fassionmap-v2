"use client";

import { usePathname } from "next/navigation";
import { BottomNav } from "./BottomNav";
import { OnboardingRedirect } from "@/components/onboarding/OnboardingRedirect";

/**
 * 전역 셸.
 *
 * 모바일:
 *   - 430px 캔버스 (iPhone 14 Pro 논리폭) — 시안의 모바일 퍼스트 톤 유지
 *   - 하단 BottomNav 노출
 *
 * 데스크톱(lg+):
 *   - max-w 캡 해제 → 풀 와이드 (SSENSE / MR PORTER 식 platform 캔버스)
 *   - BottomNav 숨김 → TopBar 안의 horizontal nav가 1차 nav 책임
 *
 * 발행 신호(StatusStrip)는 TopBar 안에 결합되어 페이지마다 함께 노출된다.
 *
 * 예외:
 *   - `/product/*`는 하단 PurchaseBar가 CTA를 차지하므로 BottomNav 숨김.
 *   - `/onboarding`은 풀스크린 플로우이므로 BottomNav 숨김.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideBottomNav =
    pathname?.startsWith("/product") || pathname?.startsWith("/onboarding");

  return (
    <OnboardingRedirect>
      <div className="relative mx-auto min-h-[100dvh] w-full max-w-[430px] bg-surface sm:max-w-[720px] lg:max-w-none">
        <div className={hideBottomNav ? "" : "pb-nav lg:pb-0"}>{children}</div>
        {!hideBottomNav && <BottomNav />}
      </div>
    </OnboardingRedirect>
  );
}
