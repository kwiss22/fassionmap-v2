import { GeminiProvider } from "@/lib/ai/providers/gemini";
import { MockProvider } from "@/lib/ai/providers/mock";
import type { LLMProvider, LLMProviderName } from "@/lib/ai/types";

function normalizeProviderName(value: string | undefined): LLMProviderName {
  if (value === "gemini") return "gemini";
  return "mock";
}

export function getLLMProvider(): LLMProvider {
  const providerName = normalizeProviderName(process.env.LLM_PROVIDER);

  if (providerName === "mock") {
    return new MockProvider();
  }

  return new GeminiProvider();
}
