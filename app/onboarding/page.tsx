"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  bodyFitIdToLabel,
  isOnboardingComplete,
  markOnboardingComplete,
  saveOnboardingPreferences,
  type BodyFitId,
} from "@/lib/onboarding-preferences";
import { OnboardingLoadingScreen } from "@/components/onboarding/OnboardingLoadingScreen";
import { OnboardingScreen } from "@/components/onboarding/OnboardingScreen";

type Phase = "form" | "loading";

export default function OnboardingPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("form");
  const [fitLabel, setFitLabel] = useState("Regular");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (isOnboardingComplete()) {
      router.replace("/feed");
      return;
    }
    setChecked(true);
  }, [router]);

  useEffect(() => {
    if (phase !== "loading") return;
    const t = setTimeout(() => {
      markOnboardingComplete();
      router.replace("/feed");
    }, 3000);
    return () => clearTimeout(t);
  }, [phase, router]);

  const handleComplete = (fitId: BodyFitId, vibeIds: string[]) => {
    saveOnboardingPreferences(fitId, vibeIds);
    setFitLabel(bodyFitIdToLabel(fitId));
    setPhase("loading");
  };

  if (!checked) {
    return (
      <main className="flex min-h-[100dvh] items-center justify-center bg-surface">
        <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-on-surface-variant">
          Loading
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-[100dvh] bg-surface text-on-surface">
      {phase === "loading" ? (
        <OnboardingLoadingScreen fit={fitLabel} />
      ) : (
        <OnboardingScreen onComplete={handleComplete} />
      )}
    </main>
  );
}
