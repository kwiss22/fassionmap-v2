"use client";

import { AI_RECOMMENDED_GROUPS, type AiRecommendedPrompt } from "@/lib/ai/recommended-prompts";

type AiRecommendedPromptsProps = {
  disabled?: boolean;
  activeId?: string | null;
  onSelect: (item: AiRecommendedPrompt) => void;
};

export function AiRecommendedPrompts({
  disabled = false,
  activeId = null,
  onSelect,
}: AiRecommendedPromptsProps) {
  return (
    <section className="flex flex-col gap-5" aria-label="추천 콘텐츠">
      <div>
        <h3 className="text-[11px] font-medium tracking-[0.24em] text-on-surface-variant">
          추천 콘텐츠
        </h3>
        <p className="mt-1 text-[12px] text-on-surface-variant">
          테마를 누르면 바로 큐레이션합니다.
        </p>
      </div>

      {AI_RECOMMENDED_GROUPS.map((group) => (
        <div key={group.id} className="flex flex-col gap-2">
          <p className="text-[10px] tracking-[0.2em] text-on-surface-variant/90">
            {group.title}
          </p>
          <div className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                data-active={activeId === item.id}
                className="chip-filter max-w-full text-left"
                onClick={() => onSelect(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}
