"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isOnboardingComplete } from "@/lib/onboarding-preferences";

const BYPASS_PREFIXES = ["/onboarding", "/product", "/admin"];

export function OnboardingRedirect({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const bypass = BYPASS_PREFIXES.some((p) => pathname.startsWith(p));
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
