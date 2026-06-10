/**
 * Home agent example prompts — same sentences passed to /search?mode=ai.
 */
export type HomeAgentPrompt = {
  id: string;
  label: string;
  prompt: string;
};

export const HOME_AGENT_PROMPTS: readonly HomeAgentPrompt[] = [
  {
    id: "rain-commute",
    label: "Rainy commute",
    prompt:
      "5'5\", curvy build, rainy day office look in NYC. Around $200, clean minimal mood",
  },
  {
    id: "weekend-date",
    label: "Weekend date",
    prompt: "Weekend date outfit, ~$100 budget, clean minimal mood, woman in her 20s",
  },
  {
    id: "office-30s",
    label: "Office 30s",
    prompt: "Office look for a woman in her 30s — minimal blazer and slacks, $300–500",
  },
  {
    id: "travel-layer",
    label: "Flight layers",
    prompt: "Long-haul flight layers — comfortable but polished, cabin to arrival",
  },
  {
    id: "saved-knit",
    label: "Saved knit tone",
    prompt: "Daily outfit similar to my saved knit style — beige and white tones",
  },
] as const;
