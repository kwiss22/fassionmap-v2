import { createHash } from "node:crypto";

import type {
  AiSearchInput,
  AiSearchResult,
  CurationInput,
  IssueDraft,
} from "@/lib/ai/types";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

type CacheEntry = {
  issueDraft: IssueDraft;
  expiresAt: number;
};

const issueDraftCache = new Map<string, CacheEntry>();

function normalizeInput(input: CurationInput) {
  return {
    issueMeta: input.issueMeta,
    trendSignals: [...input.trendSignals],
    candidateProducts: input.candidateProducts.map((p) => ({
      id: p.id,
      name: p.name,
      mall: p.mall,
      mallName: p.mallName ?? "",
      price: p.price,
      imageUrl: p.imageUrl,
      link: p.link,
      category2: p.category2 ?? "",
    })),
    maxSections: input.maxSections ?? null,
    locale: input.locale ?? null,
  };
}

export function createIssueDraftCacheKey(input: CurationInput): string {
  const normalized = normalizeInput(input);
  const payload = JSON.stringify(normalized);
  return createHash("sha256").update(payload).digest("hex");
}

function pruneExpiredEntries(nowMs = Date.now()): void {
  for (const [key, entry] of issueDraftCache) {
    if (entry.expiresAt <= nowMs) {
      issueDraftCache.delete(key);
    }
  }
}

export function getCachedIssueDraft(input: CurationInput): IssueDraft | null {
  const nowMs = Date.now();
  pruneExpiredEntries(nowMs);

  const key = createIssueDraftCacheKey(input);
  const entry = issueDraftCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= nowMs) {
    issueDraftCache.delete(key);
    return null;
  }
  return entry.issueDraft;
}

export function setCachedIssueDraft(
  input: CurationInput,
  issueDraft: IssueDraft
): void {
  const key = createIssueDraftCacheKey(input);
  issueDraftCache.set(key, {
    issueDraft,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function clearIssueDraftCache(): void {
  issueDraftCache.clear();
}

type AiSearchCacheEntry = {
  result: AiSearchResult;
  expiresAt: number;
};

const aiSearchCache = new Map<string, AiSearchCacheEntry>();

function normalizeAiSearchInput(input: AiSearchInput) {
  return {
    prompt: input.prompt.trim(),
    locale: input.locale ?? null,
  };
}

export function createAiSearchCacheKey(input: AiSearchInput): string {
  const payload = JSON.stringify(normalizeAiSearchInput(input));
  return createHash("sha256").update(`ai-search:${payload}`).digest("hex");
}

function pruneAiSearchCacheEntries(nowMs = Date.now()): void {
  for (const [key, entry] of aiSearchCache) {
    if (entry.expiresAt <= nowMs) {
      aiSearchCache.delete(key);
    }
  }
}

export function getCachedAiSearch(input: AiSearchInput): AiSearchResult | null {
  const nowMs = Date.now();
  pruneExpiredEntries(nowMs);
  pruneAiSearchCacheEntries(nowMs);

  const key = createAiSearchCacheKey(input);
  const entry = aiSearchCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= nowMs) {
    aiSearchCache.delete(key);
    return null;
  }
  return entry.result;
}

export function setCachedAiSearch(
  input: AiSearchInput,
  result: AiSearchResult
): void {
  const key = createAiSearchCacheKey(input);
  aiSearchCache.set(key, {
    result,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}
