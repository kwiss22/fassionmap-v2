"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isOnboardingComplete } from "@/lib/onboarding-preferences";

const BYPASS_PREFIXES = ["/onboarding", "/product", "/admin", "/search"];

export function OnboardingRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // "/" 는 app/page.tsx의 서버 redirect("/search")가 처리하는 순간적인 경유지라,
    // 여기서 pathname="/" 를 그대로 잡아 /onboarding으로 보내면 그 redirect와 경합한다.
    const bypass =
      pathname === "/" || BYPASS_PREFIXES.some((p) => pathname.startsWith(p));
    if (bypass) {
      setReady(true);
      return;
    }

    const done = isOnboardingComplete();
    if (!done && !pathname.startsWith("/onboarding")) {
      setReady(false);
      router.replace("/onboarding");
      return;
    }

    setReady(true);
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-surface">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-on-surface-variant">
          Loading
        </span>
      </div>
    );
  }

  return children;
}
