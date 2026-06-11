"use client";

import { useEffect, useState } from "react";
import { CURRENT_ISSUE, type EditorialIssue } from "@/lib/editorial";

type State = {
  issue: EditorialIssue;
  loading: boolean;
};

/**
 * 최신 이슈를 `/api/issue/current`에서 읽는다. 실패 시 vol-007 폴백.
 */
export function useCurrentIssue(): State {
  const [state, setState] = useState<State>({
    issue: CURRENT_ISSUE,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch("/api/issue/current");
        if (!res.ok) throw new Error(`status ${res.status}`);
        const issue = (await res.json()) as EditorialIssue;
        if (!cancelled) {
          setState({ issue, loading: false });
        }
      } catch {
        if (!cancelled) {
          setState({ issue: CURRENT_ISSUE, loading: false });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
