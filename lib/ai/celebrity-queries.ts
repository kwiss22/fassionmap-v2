import type { AiSearchPlan, AiSearchPlanSearch } from "@/lib/ai/types";

/** 자주 검색되는 국내·K-pop 셀럽 (부분 일치) */
const CELEBRITY_KEYWORDS: readonly { name: string; brands: string[] }[] = [
  { name: "제니", brands: ["샤넬", "CHANEL"] },
  { name: "지수", brands: ["디올", "Dior"] },
  { name: "로제", brands: ["입생로랑", "YSL"] },
  { name: "리사", brands: ["셀린", "Celine"] },
  { name: "카리나", brands: ["프라다", "Prada"] },
  { name: "윈터", brands: ["젠틀몬스터", "이미지웨어"] },
  { name: "장원영", brands: ["미우미우", "Miu Miu"] },
  { name: "안유진", brands: ["미우미우", "로에베"] },
  { name: "민지", brands: ["샤넬", "디올"] },
  { name: "하니", brands: ["구찌", "Gucci"] },
  { name: "설윤", brands: ["버버리", "Burberry"] },
  { name: "수지", brands: ["롤렉스", "라네즈"] },
  { name: "아이유", brands: ["구찌", "에스티로더"] },
  { name: "태연", brands: ["루이비통", "Louis Vuitton"] },
  { name: "지드래곤", brands: ["샤넬", "나이키"] },
  { name: "뷔", brands: ["셀린", "보테가"] },
  { name: "정국", brands: ["보테가", "Calvin Klein"] },
];

const CELEBRITY_SIGNAL =
  /연예인|아이돌|셀럽|스타\s*룩|스타\s*스타일|최근\s*입은|입었던|착장|공항\s*패션|무대\s*의상|레드\s*카펫/i;

const EVENT_PARIS = /파리|패션\s*위크|런웨이|컬렉션|PFW|오트\s*쿠튀르/i;
const EVENT_STAGE = /무대|공연|콘서트|뮤비|MV|무대\s*의상|안무/i;
const EVENT_AIRPORT = /공항|출국|입국/i;

const GARMENT_HINTS: readonly { pattern: RegExp; query: string }[] = [
  { pattern: /코트|아우터|재킷|블레이저|자켓/, query: "여성 오버사이즈 블레이저" },
  { pattern: /드레스|원피스|미니드레스/, query: "여성 미니드레스" },
  { pattern: /가방|백|핸드백/, query: "여성 숄더백" },
  { pattern: /신발|부츠|힐|스니커즈/, query: "여성 로퍼" },
  { pattern: /선글라스|안경/, query: "여성 선글라스" },
  { pattern: /트위드|재킷/, query: "여성 트위드 재킷" },
];

function findCelebrity(prompt: string) {
  return CELEBRITY_KEYWORDS.find((c) => prompt.includes(c.name));
}

function garmentQuery(prompt: string): string | null {
  for (const hint of GARMENT_HINTS) {
    if (hint.pattern.test(prompt)) return hint.query;
  }
  return null;
}

function buildSearches(
  celeb: (typeof CELEBRITY_KEYWORDS)[number] | undefined,
  prompt: string
): AiSearchPlanSearch[] {
  const searches: AiSearchPlanSearch[] = [];
  const name = celeb?.name;
  const brand = celeb?.brands[0];

  if (name) {
    searches.push({
      query: `${name} 코디`,
      intent: "셀럽 착장과 비슷한 쇼핑 키워드",
    });
    if (brand) {
      searches.push({
        query: `${name} ${brand}`,
        intent: "자주 입는 브랜드 톤",
      });
    }
  }

  if (EVENT_PARIS.test(prompt)) {
    searches.push({
      query: garmentQuery(prompt) ?? "여성 트위드 재킷",
      intent: "파리·패션위크 런웨이 실루엣",
    });
  } else if (EVENT_STAGE.test(prompt)) {
    searches.push({
      query: garmentQuery(prompt) ?? "여성 스테이지 코디",
      intent: "무대·퍼포먼스 룩",
    });
  } else if (EVENT_AIRPORT.test(prompt)) {
    searches.push({
      query: garmentQuery(prompt) ?? "여성 공항패션 코디",
      intent: "공항 착장 무드",
    });
  }

  const garment = garmentQuery(prompt);
  if (garment && !searches.some((s) => s.query === garment)) {
    searches.push({ query: garment, intent: "요청하신 아이템군" });
  }

  if (searches.length === 0) {
    const token = prompt.replace(/의상|옷|룩|착장|컬렉션|패션/g, " ").trim();
    const q = token.slice(0, 24) || "여성 코디";
    searches.push({ query: `${q} 코디`, intent: "확장 검색" });
    searches.push({ query: "여성 블레이저", intent: "기본 에디터 픽" });
  }

  return searches.slice(0, 3);
}

function buildPicks(searchCount: number): AiSearchPlan["picks"] {
  const picks: AiSearchPlan["picks"] = [];
  for (let si = 0; si < searchCount; si += 1) {
    picks.push({
      searchIndex: si,
      rank: 0,
      reason: "요청하신 셀럽·이벤트 무드와 가까운 상위 결과입니다.",
    });
    picks.push({
      searchIndex: si,
      rank: 1,
      reason: "같은 톤의 대안 피스입니다.",
    });
  }
  return picks.slice(0, 8);
}

function buildSummary(
  celeb: (typeof CELEBRITY_KEYWORDS)[number] | undefined,
  prompt: string
): string {
  if (celeb) {
    if (EVENT_PARIS.test(prompt)) {
      return `${celeb.name}의 파리·패션위크 착장 무드를 참고해, ${celeb.brands[0] ?? "럭셔리"} 톤과 런웨이 실루엣으로 쇼핑 가능한 유사 아이템을 골랐습니다.`;
    }
    if (EVENT_STAGE.test(prompt)) {
      return `${celeb.name}의 무대·퍼포먼스 착장에 가까운 코디 키워드로 유사 상품을 모았습니다.`;
    }
    return `${celeb.name} 스타일에 가까운 최근 셀럽 코디 키워드로 쇼핑 결과를 큐레이션했습니다.`;
  }
  return "연예인·셀럽 착장 무드에 맞춰 쇼핑 검색어를 나눠 유사 아이템을 골랐습니다.";
}

/**
 * "제니 파리 컬렉션 의상"처럼 네이버에 바로 안 나오는 문장을
 * 쇼핑 가능한 검색어 묶음으로 바꾼다.
 */
/** 네이버 뉴스·블로그 검색용 (쇼핑 API와 다른 쿼리 톤) */
export function buildContentSearchQuery(prompt: string): string {
  const trimmed = prompt.trim();
  if (!trimmed) return "패션 트렌드";

  const celeb = findCelebrity(trimmed);
  if (celeb) {
    if (EVENT_PARIS.test(trimmed)) {
      return `${celeb.name} ${celeb.brands[0] ?? ""} 파리 패션위크`.trim();
    }
    if (EVENT_STAGE.test(trimmed)) {
      return `${celeb.name} 무대 패션`;
    }
    if (EVENT_AIRPORT.test(trimmed)) {
      return `${celeb.name} 공항패션`;
    }
    return `${celeb.name} 패션`;
  }

  return trimmed.slice(0, 80);
}

export function isCelebrityStylePrompt(prompt: string): boolean {
  const trimmed = prompt.trim();
  if (!trimmed) return false;
  if (findCelebrity(trimmed)) return true;
  return CELEBRITY_SIGNAL.test(trimmed);
}

export function buildCelebritySearchPlan(prompt: string): AiSearchPlan | null {
  const trimmed = prompt.trim();
  if (!trimmed) return null;
  if (!isCelebrityStylePrompt(trimmed)) return null;

  const celeb = findCelebrity(trimmed);
  const searches = buildSearches(celeb, trimmed);
  return {
    summary: buildSummary(celeb, trimmed),
    searches,
    picks: buildPicks(searches.length),
  };
}
