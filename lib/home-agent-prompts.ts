/**
 * 홈 Agent 입력용 예시 프롬프트.
 * 검색(/search?mode=ai)과 동일한 문장을 전달한다.
 */
export type HomeAgentPrompt = {
  id: string;
  label: string;
  prompt: string;
};

export const HOME_AGENT_PROMPTS: readonly HomeAgentPrompt[] = [
  {
    id: "rain-commute",
    label: "비 오는 출근룩",
    prompt:
      "165cm, 하체 통통, 서울 비 오는 날 출근룩 추천해줘. 예산 30만 원대, 깔끔한 무드",
  },
  {
    id: "weekend-date",
    label: "주말 데이트",
    prompt: "주말 데이트룩, 예산 10만 원대, 깔끔한 미니멀 무드, 20대 여성",
  },
  {
    id: "office-30s",
    label: "30대 출근",
    prompt: "30대 여성 출근룩, 미니멀 블레이저·슬랙스, 50~80만 원대",
  },
  {
    id: "travel-layer",
    label: "기내 레이어드",
    prompt: "장거리 비행 기내·도착 후 겸용 레이어드, 편안하지만 단정한 룩",
  },
  {
    id: "saved-knit",
    label: "저장 니트 톤",
    prompt: "최근 저장한 니트 스타일과 비슷한 데일리 코디, 베이지·화이트 톤",
  },
] as const;
