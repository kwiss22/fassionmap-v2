"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Product } from "@/lib/product";
import {
  CURRENT_ISSUE,
  type EditorialIssue,
  type EditorialSection,
} from "@/lib/editorial";
import { resolveNaverQueriesForSection } from "@/lib/editorial-naver-queries";

type LoadedSection = {
  section: EditorialSection;
  items: Product[];
  loading: boolean;
  error?: string;
};

type State = {
  sections: LoadedSection[];
  ready: boolean;
  issue: EditorialIssue;
};

async function fetchCurrentIssue(): Promise<EditorialIssue> {
  try {
    const res = await fetch("/api/issue/current");
    if (!res.ok) return CURRENT_ISSUE;
    return (await res.json()) as EditorialIssue;
  } catch {
    return CURRENT_ISSUE;
  }
}

/**
 * 현재 이슈의 모든 섹션 상품을 병렬 로드한다.
 *
 * 각 섹션의 `source` 타입에 따라 쿼리 문자열을 조립해
 * `/api/naver-products`를 호출. `saved-ai`는 클라이언트 전용으로 처리하기 위해
 * 일단 빈 배열로 두고 Saved 훅이 주입하도록 설계 여지를 남긴다(이번 라운드는
 * `saved-ai` 섹션도 AI 큐레이션 mock으로서 첫 테마 쿼리를 대신 사용).
 */
export function useHomeFeed() {
  const [state, setState] = useState<State>(() => ({
    sections: CURRENT_ISSUE.sections.map((section) => ({
      section,
      items: [],
      loading: true,
    })),
    ready: false,
    issue: CURRENT_ISSUE,
  }));
  const abortRef = useRef<AbortController | null>(null);

  const loadAll = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const issue = await fetchCurrentIssue();
    if (controller.signal.aborted) return;

    setState({
      issue,
      ready: false,
      sections: issue.sections.map((section) => ({
        section,
        items: [],
        loading: true,
      })),
    });

    await Promise.all(
      issue.sections.map(async (section, idx) => {
        const size = section.size ?? 6;
        const queries = resolveNaverQueriesForSection(section);
        if (queries.length === 0) {
          setState((prev) => patchSection(prev, idx, { items: [], loading: false }));
          return;
        }

        try {
          let items: Product[] = [];
          let lastError: string | undefined;

          for (const query of queries) {
            const url = `/api/naver-products?query=${encodeURIComponent(query)}&start=1&display=${Math.min(size * 4, 40)}&sort=sim`;
            const res = await fetch(url, { signal: controller.signal });
            const json = (await res.json()) as {
              items?: Product[];
              error?: string;
            };
            if (controller.signal.aborted) return;
            lastError = json.error;
            const withImages = (json.items ?? []).filter((p) =>
              Boolean(p.imageUrl?.trim())
            );
            if (withImages.length > 0) {
              items = withImages.slice(0, size);
              break;
            }
          }

          setState((prev) =>
            patchSection(prev, idx, {
              items,
              loading: false,
              error: lastError,
            })
          );
        } catch (err) {
          if (controller.signal.aborted) return;
          setState((prev) =>
            patchSection(prev, idx, {
              items: [],
              loading: false,
              error: err instanceof Error ? err.message : "unknown",
            })
          );
        }
      })
    );

    if (!controller.signal.aborted) {
      setState((prev) => ({ ...prev, ready: true }));
    }
  }, []);

  useEffect(() => {
    void loadAll();
    return () => abortRef.current?.abort();
  }, [loadAll]);

  return state;
}

function patchSection(
  prev: State,
  idx: number,
  patch: Partial<LoadedSection>
): State {
  const next = prev.sections.slice();
  next[idx] = { ...next[idx], ...patch };
  return { ...prev, sections: next };
}
