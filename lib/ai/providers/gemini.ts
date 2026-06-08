import { buildIssueEditorPrompt } from "@/lib/ai/prompts/issue-editor";
import { buildLookBriefPrompt } from "@/lib/ai/prompts/look-brief";
import { buildProductCuratorPrompt } from "@/lib/ai/prompts/product-curator";
import {
  aiSearchPlanSchema,
  issueDraftSchema,
  lookBriefSchema,
} from "@/lib/ai/schema";
import type {
  AiLookBrief,
  AiSearchInput,
  AiSearchPlan,
  IssueDraft,
  LLMProvider,
  LookBriefInput,
} from "@/lib/ai/types";
const GEMINI_MODEL = "gemini-2.5-pro";

const ISSUE_DRAFT_RESPONSE_SCHEMA = {
  type: "object",
  required: [
    "vol",
    "season",
    "title",
    "dek",
    "date",
    "city",
    "coverLabel",
    "coverImage",
    "coverAlt",
    "primaryCtaLabel",
    "primaryCtaHref",
    "secondaryCtaLabel",
    "secondaryCtaHref",
    "tickerItems",
    "sections",
  ],
  properties: {
    vol: { type: "string" },
    season: { type: "string" },
    title: { type: "string" },
    titleHighlight: { type: "string" },
    dek: { type: "string" },
    date: { type: "string" },
    city: { type: "string" },
    coverLabel: { type: "string" },
    coverImage: { type: "string" },
    coverAlt: { type: "string" },
    coverFocal: { type: "string" },
    primaryCtaLabel: { type: "string" },
    primaryCtaHref: { type: "string" },
    secondaryCtaLabel: { type: "string" },
    secondaryCtaHref: { type: "string" },
    tickerItems: { type: "array", items: { type: "string" } },
    sections: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "eyebrow", "title", "source"],
        properties: {
          id: { type: "string" },
          eyebrow: { type: "string" },
          title: { type: "string" },
          titleHighlight: { type: "string" },
          subtitle: { type: "string" },
          size: { type: "number" },
          source: {
            type: "object",
            required: ["type"],
            properties: {
              type: { type: "string" },
              brandSlug: { type: "string" },
              category: { type: "string" },
              query: { type: "string" },
              size: { type: "number" },
            },
          },
        },
      },
    },
  },
} as const;

const AI_SEARCH_RESPONSE_SCHEMA = {
  type: "object",
  required: ["summary", "searches", "picks"],
  properties: {
    summary: { type: "string" },
    searches: {
      type: "array",
      items: {
        type: "object",
        required: ["query"],
        properties: {
          query: { type: "string" },
          intent: { type: "string" },
        },
      },
    },
    picks: {
      type: "array",
      items: {
        type: "object",
        required: ["searchIndex", "rank", "reason"],
        properties: {
          searchIndex: { type: "number" },
          rank: { type: "number" },
          reason: { type: "string" },
        },
      },
    },
  },
} as const;

const LOOK_BRIEF_RESPONSE_SCHEMA = {
  type: "object",
  required: [
    "headline",
    "whereFrom",
    "brandOrItem",
    "priceNote",
    "editorialSummary",
  ],
  properties: {
    headline: { type: "string" },
    whereFrom: { type: "string" },
    brandOrItem: { type: "string" },
    priceNote: { type: "string" },
    shoppingPriceRange: { type: "string" },
    editorialSummary: { type: "string" },
  },
} as const;

export class GeminiProvider implements LLMProvider {
  readonly name = "gemini" as const;

  async generateIssueDraft(
    input: Parameters<LLMProvider["generateIssueDraft"]>[0],
    options: Parameters<LLMProvider["generateIssueDraft"]>[1]
  ): Promise<IssueDraft> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is missing.");
    }

    let GoogleGenerativeAI: any;
    let SchemaType: any;
    try {
      const mod = (await import("@google/generative-ai")) as any;
      GoogleGenerativeAI = mod.GoogleGenerativeAI;
      SchemaType = mod.SchemaType;
    } catch {
      throw new Error(
        "Missing @google/generative-ai dependency. Install it before using LLM_PROVIDER=gemini."
      );
    }

    const promptMessages = buildIssueEditorPrompt(input);
    const prompt = promptMessages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        maxOutputTokens: options.maxOutputTokens,
        temperature: options.temperature ?? 0.3,
        responseMimeType: "application/json",
        responseSchema: toGeminiSchema(ISSUE_DRAFT_RESPONSE_SCHEMA, SchemaType),
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response?.text?.();
    if (!text) {
      throw new Error("Gemini returned empty response.");
    }

    const parsed = JSON.parse(text) as unknown;
    return issueDraftSchema.parse(parsed);
  }

  async generateAiSearchPlan(
    input: AiSearchInput,
    options: Parameters<LLMProvider["generateAiSearchPlan"]>[1]
  ): Promise<AiSearchPlan> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is missing.");
    }

    let GoogleGenerativeAI: any;
    let SchemaType: any;
    try {
      const mod = (await import("@google/generative-ai")) as any;
      GoogleGenerativeAI = mod.GoogleGenerativeAI;
      SchemaType = mod.SchemaType;
    } catch {
      throw new Error(
        "Missing @google/generative-ai dependency. Install it before using LLM_PROVIDER=gemini."
      );
    }

    const promptMessages = buildProductCuratorPrompt(input);
    const prompt = promptMessages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        maxOutputTokens: options.maxOutputTokens,
        temperature: options.temperature ?? 0.35,
        responseMimeType: "application/json",
        responseSchema: toGeminiSchema(AI_SEARCH_RESPONSE_SCHEMA, SchemaType),
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response?.text?.();
    if (!text) {
      throw new Error("Gemini returned empty response.");
    }

    const parsed = JSON.parse(text) as unknown;
    return aiSearchPlanSchema.parse(parsed);
  }

  async generateLookBrief(
    input: LookBriefInput,
    options: Parameters<LLMProvider["generateLookBrief"]>[1]
  ): Promise<AiLookBrief> {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error("GOOGLE_AI_API_KEY is missing.");
    }

    let GoogleGenerativeAI: any;
    let SchemaType: any;
    try {
      const mod = (await import("@google/generative-ai")) as any;
      GoogleGenerativeAI = mod.GoogleGenerativeAI;
      SchemaType = mod.SchemaType;
    } catch {
      throw new Error(
        "Missing @google/generative-ai dependency. Install it before using LLM_PROVIDER=gemini."
      );
    }

    const promptMessages = buildLookBriefPrompt(input);
    const prompt = promptMessages
      .map((m) => `[${m.role.toUpperCase()}]\n${m.content}`)
      .join("\n\n");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        maxOutputTokens: options.maxOutputTokens,
        temperature: options.temperature ?? 0.3,
        responseMimeType: "application/json",
        responseSchema: toGeminiSchema(LOOK_BRIEF_RESPONSE_SCHEMA, SchemaType),
      },
    });

    const result = await model.generateContent(prompt);
    const text = result.response?.text?.();
    if (!text) {
      throw new Error("Gemini returned empty response.");
    }

    const parsed = JSON.parse(text) as unknown;
    return lookBriefSchema.parse(parsed);
  }
}

function toGeminiSchema(
  node: any,
  SchemaType: {
    OBJECT: unknown;
    ARRAY: unknown;
    STRING: unknown;
    NUMBER: unknown;
    BOOLEAN: unknown;
  }
): any {
  const mapType = (type: string): unknown => {
    if (type === "object") return SchemaType.OBJECT;
    if (type === "array") return SchemaType.ARRAY;
    if (type === "string") return SchemaType.STRING;
    if (type === "number") return SchemaType.NUMBER;
    if (type === "boolean") return SchemaType.BOOLEAN;
    return SchemaType.STRING;
  };

  if (node.type === "object") {
    const properties: Record<string, any> = {};
    for (const [key, value] of Object.entries(node.properties ?? {})) {
      properties[key] = toGeminiSchema(value, SchemaType);
    }
    return {
      type: mapType("object"),
      properties,
      required: node.required ?? [],
    };
  }

  if (node.type === "array") {
    return {
      type: mapType("array"),
      items: toGeminiSchema(node.items, SchemaType),
    };
  }

  return { type: mapType(node.type) };
}
