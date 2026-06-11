"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { type Product } from "@/lib/product";
import {
  CURRENT_ISSUE,
  type EditorialIssue,
  type EditorialSection,
  resolveBrandQuery,
} from "@/lib/editorial";

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
        const query = buildQueryForSection(section);

        if (!query) {
          setState((prev) => patchSection(prev, idx, { items: [], loading: false }));
          return;
        }

        try {
          const url = `/api/naver-products?query=${encodeURIComponent(query)}&start=1&display=${size * 2}&sort=sim`;
          const res = await fetch(url, { signal: controller.signal });
          const json = (await res.json()) as { items?: Product[]; error?: string };
          if (controller.signal.aborted) return;
          const items = (json.items ?? []).slice(0, size);
          setState((prev) =>
            patchSection(prev, idx, {
              items,
              loading: false,
              error: json.error,
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

function buildQueryForSection(section: EditorialSection): string {
  switch (section.source.type) {
    case "brand": {
      const base = resolveBrandQuery(section.source.brandSlug);
      return section.source.category
        ? `${base} ${section.source.category}`
        : base;
    }
    case "theme":
      return section.source.query;
    case "saved-ai":
      return "캐시미어 니트";
  }
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
