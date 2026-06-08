export type AiRecommendedPrompt = {
  id: string;
  /** 칩에 보이는 짧은 라벨 */
  label: string;
  /** API에 전달할 전체 문장 */
  prompt: string;
};

export type AiRecommendedGroup = {
  id: string;
  title: string;
  items: AiRecommendedPrompt[];
};

export const AI_RECOMMENDED_GROUPS: readonly AiRecommendedGroup[] = [
  {
    id: "region",
    title: "지역 · 시즌",
    items: [
      {
        id: "paris-fw",
        label: "파리 패션위크",
        prompt: "파리 패션위크에서 화제 된 여성 럭셔리 룩, 트위드·오버사이즈 코트",
      },
      {
        id: "milan",
        label: "밀란 랭킹",
        prompt: "밀란 패션위크 맨투맨·가죽·테일러드 포인트 남녀 룩",
      },
      {
        id: "seoul-street",
        label: "서울 스트릿",
        prompt: "서울 성수·한남 스트릿 패션, 미니멀 블랙 코디 20대",
      },
      {
        id: "ny-fw",
        label: "뉴욕 위크",
        prompt: "뉴욕 패션위크 데님·블레이저 레이어드 여성 룩",
      },
    ],
  },
  {
    id: "mood",
    title: "무드 · 상황",
    items: [
      {
        id: "girlfriend",
        label: "여친룩",
        prompt: "여친룩 데이트 코디, 부드러운 니트·미디 스커트·로퍼 20대 여성",
      },
      {
        id: "office-30s",
        label: "30대 출근룩",
        prompt: "30대 여성 출근룩, 미니멀 블레이저·슬랙스·로퍼 50~80만 원대",
      },
      {
        id: "weekend",
        label: "주말 브런치",
        prompt: "주말 브런치 데이트, 린넨 셔츠·와이드 팬츠·스니커즈 여성",
      },
      {
        id: "minimal",
        label: "미니멀 데일리",
        prompt: "미니멀 데일리룩, 베이지·화이트 톤 코튼·니트 20~30대",
      },
    ],
  },
  {
    id: "celebrity",
    title: "셀럽 · 이슈",
    items: [
      {
        id: "jennie-paris",
        label: "제니 파리",
        prompt: "제니 파리 패션위크 착장, 샤넬 룩 유사 아이템",
      },
      {
        id: "jisoo-airport",
        label: "지수 공항패션",
        prompt: "지수 공항 패션, 디올 톤 코트·가방 코디",
      },
      {
        id: "karina-stage",
        label: "카리나 무대",
        prompt: "카리나 무대 의상, 퍼포먼스 코디 유사 쇼핑",
      },
    ],
  },
] as const;
