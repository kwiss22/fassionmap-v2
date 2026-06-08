import type { Product } from "@/lib/product";

/** 룩 카드 안 한 슬롯(상의·하의 등) */
export type LookPieceRole = "top" | "bottom" | "outer" | "shoes" | "bag";

export type LookPiece = {
  role: LookPieceRole;
  label: string;
  product: Product | null;
};

export type StylingLook = {
  id: string;
  title: string;
  /** 카드 상단에 보이는 짧은 추천 이유 */
  reason: string;
  context?: string;
  pieces: LookPiece[];
};

export type StylingLookDef = {
  id: string;
  title: string;
  reason: string;
  context?: string;
  /** 슬롯별 네이버 검색 쿼리 */
  queries: Partial<Record<LookPieceRole, string>>;
};

const ROLE_LABELS: Record<LookPieceRole, string> = {
  top: "상의",
  bottom: "하의",
  outer: "아우터",
  shoes: "신발",
  bag: "가방",
};

export const HOME_LOOK_DEFS: readonly StylingLookDef[] = [
  {
    id: "rain-commute",
    title: "비 오는 날 출근",
    reason: "발수 아우터와 어두운 하의로 하체를 슬림하게",
    context: "출근 · 비",
    queries: {
      outer: "여성 트렌치코트",
      top: "여성 니트",
      bottom: "여성 슬랙스",
      shoes: "여성 로퍼",
    },
  },
  {
    id: "weekend-date",
    title: "주말 데이트",
    reason: "부드러운 니트와 A라인으로 체형 커버",
    context: "데이트 · 주말",
    queries: {
      top: "여성 니트",
      bottom: "여성 미디 스커트",
      shoes: "여성 로퍼",
      bag: "여성 숄더백",
    },
  },
  {
    id: "minimal-daily",
    title: "미니멀 데일리",
    reason: "저장한 니트 톤과 맞춘 베이지·화이트 레이어",
    context: "데일리",
    queries: {
      top: "여성 캐시미어 니트",
      bottom: "여성 와이드 팬츠",
      shoes: "여성 스니커즈",
    },
  },
  {
    id: "layer-travel",
    title: "기내 레이어드",
    reason: "온도 차에 대응하는 가벼운 아우터 조합",
    context: "여행",
    queries: {
      outer: "여성 자켓",
      top: "여성 맨투맨",
      bottom: "여성 조거팬츠",
      shoes: "여성 스니커즈",
    },
  },
] as const;

export function lookDefToEmptyLook(def: StylingLookDef): StylingLook {
  const roles = Object.keys(def.queries) as LookPieceRole[];
  return {
    id: def.id,
    title: def.title,
    reason: def.reason,
    context: def.context,
    pieces: roles.map((role) => ({
      role,
      label: ROLE_LABELS[role],
      product: null,
    })),
  };
}

export function mergeLookProducts(
  def: StylingLookDef,
  byRole: Partial<Record<LookPieceRole, Product | null>>
): StylingLook {
  const roles = Object.keys(def.queries) as LookPieceRole[];
  return {
    id: def.id,
    title: def.title,
    reason: def.reason,
    context: def.context,
    pieces: roles.map((role) => ({
      role,
      label: ROLE_LABELS[role],
      product: byRole[role] ?? null,
    })),
  };
}
