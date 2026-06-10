import { APP_MARKET } from "@/lib/market";
import type { AiSearchPlan, AiSearchPlanSearch } from "@/lib/ai/types";

type CelebrityEntry = {
  /** Display name in current locale */
  label: { en: string; ko: string };
  /** Substrings to match in user prompt */
  aliases: string[];
  brands: string[];
};

const CELEBRITIES: readonly CelebrityEntry[] = [
  { label: { en: "Jennie", ko: "제니" }, aliases: ["제니", "jennie"], brands: ["Chanel", "샤넬"] },
  { label: { en: "Jisoo", ko: "지수" }, aliases: ["지수", "jisoo"], brands: ["Dior", "디올"] },
  { label: { en: "Rosé", ko: "로제" }, aliases: ["로제", "rose", "rosé"], brands: ["YSL", "입생로랑"] },
  { label: { en: "Lisa", ko: "리사" }, aliases: ["리사", "lisa"], brands: ["Celine", "셀린"] },
  { label: { en: "Karina", ko: "카리나" }, aliases: ["카리나", "karina"], brands: ["Prada", "프라다"] },
  { label: { en: "Winter", ko: "윈터" }, aliases: ["윈터", "winter"], brands: ["Gentle Monster"] },
  { label: { en: "Wonyoung", ko: "장원영" }, aliases: ["장원영", "wonyoung"], brands: ["Miu Miu", "미우미우"] },
  { label: { en: "Yujin", ko: "안유진" }, aliases: ["안유진", "yujin"], brands: ["Miu Miu", "Loewe"] },
  { label: { en: "Minji", ko: "민지" }, aliases: ["민지", "minji"], brands: ["Chanel", "Dior"] },
  { label: { en: "Hanni", ko: "하니" }, aliases: ["하니", "hanni"], brands: ["Gucci", "구찌"] },
  { label: { en: "Sullyoon", ko: "설윤" }, aliases: ["설윤", "sullyoon"], brands: ["Burberry"] },
  { label: { en: "Suzy", ko: "수지" }, aliases: ["수지", "suzy"], brands: ["Gucci"] },
  { label: { en: "IU", ko: "아이유" }, aliases: ["아이유", "iu"], brands: ["Gucci"] },
  { label: { en: "Taeyeon", ko: "태연" }, aliases: ["태연", "taeyeon"], brands: ["Louis Vuitton"] },
  { label: { en: "G-Dragon", ko: "지드래곤" }, aliases: ["지드래곤", "g-dragon", "gd"], brands: ["Chanel", "Nike"] },
  { label: { en: "V", ko: "뷔" }, aliases: ["뷔", "taehyung"], brands: ["Celine", "Bottega"] },
  { label: { en: "Jungkook", ko: "정국" }, aliases: ["정국", "jungkook"], brands: ["Bottega", "Calvin Klein"] },
];

const CELEBRITY_SIGNAL_KO =
  /연예인|아이돌|셀럽|스타\s*룩|스타\s*스타일|최근\s*입은|입었던|착장|공항\s*패션|무대\s*의상|레드\s*카펫/i;

const CELEBRITY_SIGNAL_EN =
  /celebrity|idol|star\s*look|star\s*style|wore|outfit|airport\s*fashion|stage\s*outfit|red\s*carpet/i;

const EVENT_PARIS_KO = /파리|패션\s*위크|런웨이|컬렉션|PFW|오트\s*쿠튀르/i;
const EVENT_PARIS_EN = /paris|fashion\s*week|runway|collection|pfw|couture/i;

const EVENT_STAGE_KO = /무대|공연|콘서트|뮤비|MV|무대\s*의상|안무/i;
const EVENT_STAGE_EN = /stage|concert|performance|music\s*video|mv/i;

const EVENT_AIRPORT_KO = /공항|출국|입국/i;
const EVENT_AIRPORT_EN = /airport|departure|arrival/i;

const GARMENT_HINTS_EN: readonly { pattern: RegExp; query: string }[] = [
  { pattern: /coat|jacket|blazer|outerwear/i, query: "women oversized blazer" },
  { pattern: /dress|gown|midi/i, query: "women mini dress" },
  { pattern: /bag|handbag|purse/i, query: "women shoulder bag" },
  { pattern: /shoe|boot|heel|sneaker|loafer/i, query: "women loafers" },
  { pattern: /sunglasses|eyewear/i, query: "women sunglasses" },
  { pattern: /tweed/i, query: "women tweed jacket" },
];

const GARMENT_HINTS_KO: readonly { pattern: RegExp; query: string }[] = [
  { pattern: /코트|아우터|재킷|블레이저|자켓/, query: "여성 오버사이즈 블레이저" },
  { pattern: /드레스|원피스|미니드레스/, query: "여성 미니드레스" },
  { pattern: /가방|백|핸드백/, query: "여성 숄더백" },
  { pattern: /신발|부츠|힐|스니커즈/, query: "여성 로퍼" },
  { pattern: /선글라스|안경/, query: "여성 선글라스" },
  { pattern: /트위드|재킷/, query: "여성 트위드 재킷" },
];

function isEnglishLocale(locale?: string): boolean {
  return (locale ?? APP_MARKET.locale) === "en-US";
}

function findCelebrity(prompt: string): CelebrityEntry | undefined {
  const lower = prompt.toLowerCase();
  return CELEBRITIES.find((c) =>
    c.aliases.some((a) => lower.includes(a.toLowerCase().trim()))
  );
}

function garmentQuery(prompt: string, locale?: string): string | null {
  const hints = isEnglishLocale(locale) ? GARMENT_HINTS_EN : GARMENT_HINTS_KO;
  for (const hint of hints) {
    if (hint.pattern.test(prompt)) return hint.query;
  }
  return null;
}

function isParisEvent(prompt: string, locale?: string): boolean {
  return isEnglishLocale(locale)
    ? EVENT_PARIS_EN.test(prompt)
    : EVENT_PARIS_KO.test(prompt);
}

function isStageEvent(prompt: string, locale?: string): boolean {
  return isEnglishLocale(locale)
    ? EVENT_STAGE_EN.test(prompt)
    : EVENT_STAGE_KO.test(prompt);
}

function isAirportEvent(prompt: string, locale?: string): boolean {
  return isEnglishLocale(locale)
    ? EVENT_AIRPORT_EN.test(prompt)
    : EVENT_AIRPORT_KO.test(prompt);
}

function buildSearches(
  celeb: CelebrityEntry | undefined,
  prompt: string,
  locale?: string
): AiSearchPlanSearch[] {
  const en = isEnglishLocale(locale);
  const searches: AiSearchPlanSearch[] = [];
  const name = celeb ? (en ? celeb.label.en : celeb.label.ko) : undefined;
  const brand = celeb?.brands[0];

  if (name) {
    searches.push({
      query: en ? `${name} style outfit` : `${name} 코디`,
      intent: en
        ? "Shoppable keywords near the celebrity look"
        : "셀럽 착장과 비슷한 쇼핑 키워드",
    });
    if (brand) {
      searches.push({
        query: en ? `${name} ${brand}` : `${name} ${brand}`,
        intent: en ? "Brand tone they often wear" : "자주 입는 브랜드 톤",
      });
    }
  }

  if (isParisEvent(prompt, locale)) {
    searches.push({
      query: garmentQuery(prompt, locale) ?? (en ? "women tweed jacket" : "여성 트위드 재킷"),
      intent: en ? "Paris runway silhouette" : "파리·패션위크 런웨이 실루엣",
    });
  } else if (isStageEvent(prompt, locale)) {
    searches.push({
      query: garmentQuery(prompt, locale) ?? (en ? "women stage outfit" : "여성 스테이지 코디"),
      intent: en ? "Stage performance look" : "무대·퍼포먼스 룩",
    });
  } else if (isAirportEvent(prompt, locale)) {
    searches.push({
      query: garmentQuery(prompt, locale) ?? (en ? "women airport outfit" : "여성 공항패션 코디"),
      intent: en ? "Airport off-duty mood" : "공항 착장 무드",
    });
  }

  const garment = garmentQuery(prompt, locale);
  if (garment && !searches.some((s) => s.query === garment)) {
    searches.push({
      query: garment,
      intent: en ? "Requested garment category" : "요청하신 아이템군",
    });
  }

  if (searches.length === 0) {
    const token = en
      ? prompt.replace(/\b(outfit|look|style|fashion|wear)\b/gi, " ").trim()
      : prompt.replace(/의상|옷|룩|착장|컬렉션|패션/g, " ").trim();
    const q = token.slice(0, 32) || (en ? "women outfit" : "여성 코디");
    searches.push({
      query: en ? `${q} women` : `${q} 코디`,
      intent: en ? "Expanded search" : "확장 검색",
    });
    searches.push({
      query: en ? "women blazer" : "여성 블레이저",
      intent: en ? "Editor baseline pick" : "기본 에디터 픽",
    });
  }

  return searches.slice(0, 3);
}

function buildPicks(searchCount: number, locale?: string): AiSearchPlan["picks"] {
  const en = isEnglishLocale(locale);
  const picks: AiSearchPlan["picks"] = [];
  for (let si = 0; si < searchCount; si += 1) {
    picks.push({
      searchIndex: si,
      rank: 0,
      reason: en
        ? "Top result closest to the requested celebrity or event mood."
        : "요청하신 셀럽·이벤트 무드와 가까운 상위 결과입니다.",
    });
    picks.push({
      searchIndex: si,
      rank: 1,
      reason: en ? "Alternative piece in a similar tone." : "같은 톤의 대안 피스입니다.",
    });
  }
  return picks.slice(0, 8);
}

function buildSummary(
  celeb: CelebrityEntry | undefined,
  prompt: string,
  locale?: string
): string {
  const en = isEnglishLocale(locale);
  const name = celeb ? (en ? celeb.label.en : celeb.label.ko) : undefined;
  const brand = celeb?.brands[0];

  if (celeb && name) {
    if (isParisEvent(prompt, locale)) {
      return en
        ? `Using ${name}'s Paris Fashion Week mood as a guide, we targeted shoppable pieces in a ${brand ?? "luxury"} tone and runway silhouette.`
        : `${name}의 파리·패션위크 착장 무드를 참고해, ${brand ?? "럭셔리"} 톤과 런웨이 실루엣으로 쇼핑 가능한 유사 아이템을 골랐습니다.`;
    }
    if (isStageEvent(prompt, locale)) {
      return en
        ? `Curated shoppable items close to ${name}'s stage and performance styling.`
        : `${name}의 무대·퍼포먼스 착장에 가까운 코디 키워드로 유사 상품을 모았습니다.`;
    }
    return en
      ? `Curated shopping results using keywords close to ${name}'s recent style.`
      : `${name} 스타일에 가까운 최근 셀럽 코디 키워드로 쇼핑 결과를 큐레이션했습니다.`;
  }
  return en
    ? "Split the celebrity or event mood into shoppable searches and picked similar items."
    : "연예인·셀럽 착장 무드에 맞춰 쇼핑 검색어를 나눠 유사 아이템을 골랐습니다.";
}

export function buildContentSearchQuery(prompt: string, locale?: string): string {
  const trimmed = prompt.trim();
  const en = isEnglishLocale(locale);
  if (!trimmed) return en ? "fashion trend" : "패션 트렌드";

  const celeb = findCelebrity(trimmed);
  if (celeb) {
    const name = en ? celeb.label.en : celeb.label.ko;
    const brand = celeb.brands[0] ?? "";
    if (isParisEvent(trimmed, locale)) {
      return en
        ? `${name} ${brand} Paris Fashion Week`.trim()
        : `${name} ${brand} 파리 패션위크`.trim();
    }
    if (isStageEvent(trimmed, locale)) {
      return en ? `${name} stage fashion` : `${name} 무대 패션`;
    }
    if (isAirportEvent(trimmed, locale)) {
      return en ? `${name} airport fashion` : `${name} 공항패션`;
    }
    return en ? `${name} fashion` : `${name} 패션`;
  }

  return trimmed.slice(0, 80);
}

export function isCelebrityStylePrompt(prompt: string, locale?: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed) return false;
  if (findCelebrity(trimmed)) return true;
  return isEnglishLocale(locale)
    ? CELEBRITY_SIGNAL_EN.test(trimmed)
    : CELEBRITY_SIGNAL_KO.test(trimmed);
}

export function buildCelebritySearchPlan(
  prompt: string,
  locale?: string
): AiSearchPlan | null {
  const trimmed = prompt.trim();
  if (!trimmed) return null;
  if (!isCelebrityStylePrompt(trimmed, locale)) return null;

  const celeb = findCelebrity(trimmed);
  const searches = buildSearches(celeb, trimmed, locale);
  return {
    summary: buildSummary(celeb, trimmed, locale),
    searches,
    picks: buildPicks(searches.length, locale),
  };
}
