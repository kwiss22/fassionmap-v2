import type { EditorialIssue, EditorialSection } from "@/lib/editorial";
import type { Product } from "@/lib/product";

export type LLMProviderName = "mock" | "gemini";

export type CurationInput = {
  issueMeta: Pick<EditorialIssue, "vol" | "season" | "date" | "city">;
  trendSignals: string[];
  candidateProducts: Product[];
  maxSections?: number;
  locale?: "ko-KR" | "en-US";
};

export type IssueDraftSection = Pick<
  EditorialSection,
  "id" | "eyebrow" | "title" | "titleHighlight" | "subtitle" | "source" | "size"
>;

export type IssueDraft = Pick<
  EditorialIssue,
  | "vol"
  | "season"
  | "title"
  | "titleHighlight"
  | "dek"
  | "date"
  | "city"
  | "coverLabel"
  | "coverImage"
  | "coverAlt"
  | "coverFocal"
  | "primaryCtaLabel"
  | "primaryCtaHref"
  | "secondaryCtaLabel"
  | "secondaryCtaHref"
  | "tickerItems"
> & {
  sections: IssueDraftSection[];
};

export type GenerateIssueOptions = {
  maxOutputTokens: number;
  temperature?: number;
};

export type AiSearchInput = {
  prompt: string;
  locale?: "ko-KR" | "en-US";
};

export type AiSearchPlanSearch = {
  query: string;
  intent?: string;
};

export type AiSearchPlanPick = {
  searchIndex: number;
  rank: number;
  reason: string;
};

export type AiSearchPlan = {
  summary: string;
  searches: AiSearchPlanSearch[];
  picks: AiSearchPlanPick[];
};

export type AiSearchCuratedItem = {
  product: Product;
  reason: string;
};

export type AiContentArticle = {
  title: string;
  description: string;
  link: string;
  source: "news" | "blog";
  pubDate?: string;
};

export type AiLookBrief = {
  /** 한 줄 헤드라인 */
  headline: string;
  /** 어디서/어떤 행사 (예: 샤넬 파리 패션위크) */
  whereFrom: string;
  /** 브랜드·아이템 추정 */
  brandOrItem: string;
  /** 공식 가격·런웨이 피스 등 가격 맥락 */
  priceNote: string;
  /** 유사 쇼핑품 가격대 (네이버 결과 기반, 있을 때) */
  shoppingPriceRange?: string;
  /** 2~3문장 에디터 요약 */
  editorialSummary: string;
};

export type LookBriefInput = {
  prompt: string;
  articles: AiContentArticle[];
  planSummary?: string;
  locale?: "ko-KR" | "en-US";
};

export type AiSearchResult = {
  summary: string;
  lookBrief: AiLookBrief;
  articles: AiContentArticle[];
  items: AiSearchCuratedItem[];
  provider: LLMProviderName;
};

export interface LLMProvider {
  readonly name: LLMProviderName;
  generateIssueDraft(
    input: CurationInput,
    options: GenerateIssueOptions
  ): Promise<IssueDraft>;
  generateAiSearchPlan(
    input: AiSearchInput,
    options: GenerateIssueOptions
  ): Promise<AiSearchPlan>;
  generateLookBrief(
    input: LookBriefInput,
    options: GenerateIssueOptions
  ): Promise<AiLookBrief>;
}