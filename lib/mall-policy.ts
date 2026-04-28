/**
 * 네이버 쇼핑 `mallName` 정책.
 *
 * 네이버는 같은 몰도 "(주)OOO", "OOO몰", "OOO 공식스토어"처럼 표기가 제각각이고,
 * 영문/한글을 섞어 뱉기 때문에 정확 일치로 매칭하면 놓친다. 정규식 기반 부분매칭이 현실적이다.
 *
 * - BLOCK_PATTERNS: 도매/직구/대리구매 등 에디토리얼 톤과 명백히 충돌하는 몰.
 *   서버사이드에서 아예 drop 한다.
 * - BOOST_PATTERNS: 국내외 주요 편집숍·백화점·프리미엄 몰. 피드 상단으로 stable하게 끌어올린다.
 *
 * 리스트는 보수적으로 시작하고, 실데이터의 mallName 분포를 본 뒤 점진 확장한다.
 */

const BLOCK_PATTERNS: readonly RegExp[] = [
  // 해외 저가 직구/물류 플랫폼 계열
  /알리\s*익스프레스/i,
  /aliexpress/i,
  /타오바오|taobao/i,
  /temu/i,
  /banggood/i,
  /shein/i,
  /해외\s*직구/,
  /구매\s*대행/,

  // 국내 도매/사입/공구 전문몰
  /\b도매\b/,
  /사입\s*(몰|전문|센터)/,
  /공동\s*구매/,
  /\b수입\s*보세\b/,

  // 재고 처분·떨이·공장 직판 계열
  /떨이/,
  /땡처리/,
  /\b재고\s*(정리|처분|할인|몰)\b/,
  /\b창고\s*(정리|개방|세일)\b/,
  /\b공장\s*(직판|직영|직거래)\b/,
  /파격\s*할인/,

  // 2026-04 실데이터 튜닝: 중국 드랍쉬핑 / 키워드 스터핑 저가 스마트스토어.
  // 네이버에서 "디자이너 자켓", "디자이너 원피스" 등 프리미엄 키워드를 쿼리해도
  // 상위 50위 안에 다량 노출되는 mallName들. 에디토리얼 컨셉과 불일치.
  //
  // NOTE: JS 정규식의 `\b`는 ASCII word 기준이라 순수 한글 패턴에는 쓰면 안 된다.
  // 아래 한글-only 패턴에는 일부러 `\b`를 붙이지 않았다.
  /라포디드/,
  /코이블리/,
  /로이아나/,
  /퍼플\s*터틀\d*/,
  /와짱몰/,
  /홍콩\s*로직스/,
  /ted\s*여인천하/i,
  /77맘즈/,
  /제이원\d+/,
  /라브엠/,
  /마스터\s*shop/i,
  /디자이너\s*점빵/,
  /songsm\d+/i,
  /직구\s*울프/,
  /최강\s*직구/,
  /룩스비비드|luxvivid/i,
  /\bbk\.?\s*min\b/i,
  /룰루\s*제이/,
  /조블리\s*마켓/,
  /제이플로우/,
  /여성의류\s*올리버/,
  /애즈라이크/,
  /러브썸원/,
  /그린라이프\s*허브/,
  /키즈캐슬/,
  /몽글라라/,
  /로로스키니/,
  /이마백|멘다백|메띠에\s*하르/, // 무브랜드 generic 가방몰
  /여성\s*니트\s*코디/,
  /서번트/, // "남자셔츠 링클프리 남방남자출근룩" 류 키워드 스터핑
  /행복한\s*마님/,
  /강동\s*프리미엄/,
  /나쇼중/,

  // 명품 벨트 "호환/교체용" 전문몰 (29mm 가죽끈 판매) — 정품이 아닌 대체품
  /레더\s*팜/,
  /\bmontmilan\b/i,
  /셀러리아\s*디파르마/,
  /어버너/,
  /디니떼/,
  /디포나인/,

  // TV 홈쇼핑 / 모바일 애그리게이터 — 에디토리얼 톤과 불일치
  /cj\s*온스타일|cj\s*오쇼핑/i,
  /지그재그/,
  /롯데\s*홈쇼핑/,
  /gsshop|gs\s*홈쇼핑/i,
  /nsmall|농수산\s*홈쇼핑/i,
];

const BOOST_PATTERNS: readonly RegExp[] = [
  /farfetch|파페치/i,
  /\b29cm\b|이십구\s*센티미터/i,
  /w\s*concept|w\s*컨셉|더블유\s*컨셉/i,
  /musinsa|무신사/i,
  /ssf\s*shop|ssf샵/i,
  /ssg(\.com|닷컴)?|신세계\s*(백화점|몰)/i,
  /lf\s*몰|\blf\b/i,
  /한섬|h몰/i,
  /matchesfashion|매치스\s*패션/i,
  /net[-\s]?a[-\s]?porter|네타포르테/i,
  /mr\.?\s*porter|미스터\s*포터/i,
  /boontheshop|분더샵/i,
  /beaker|비이커/i,
  /10\s*corso\s*como|10\s*꼬르소\s*꼬모/i,
  /galleria|갤러리아/i,
  /현대\s*(백화점)?|더\s*현대/,
  /롯데\s*(on|온)|lotte\s*on/i,
  /halfclub|하프\s*클럽/i,
  /kolon\s*mall|코오롱\s*몰/i,
  /samsung\s*fashion|삼성\s*물산/i,
  /mytheresa|마이\s*테레사/i,
  /mrporter|mrp/i,

  // 2026-04 실데이터 튜닝: 실제 럭셔리 상품 리스팅을 주로 다루는 것으로 확인된 리셀/편집 스토어
  /프리미엄스니커즈/, // 살로몬·로로피아나·벨루티 등 실 럭셔리 스니커즈 다수
  /웨스트런던/, // 버버리·구찌 정품 리셀러
  /피오르노/, // 프라다 정품 로퍼 리셀러
  /헤르떼\s*캐시미어/, // GOBI 고비 캐시미어 공식 stockist

  // 글로벌 브랜드 병행수입/국내백화점 취급 셀러 (Polo / Tommy / Lacoste 중심)
  /바이찬스/,
  /포니홀릭/,
  /세레나\s*마켓/,
  /홀리스\s*패션/,
  /부스더샵/,
  /파인\s*스트리트/,
  /트위티\s*155/,
];

export function isBlockedMall(mallName: string | undefined | null): boolean {
  if (!mallName) return false;
  return BLOCK_PATTERNS.some((pattern) => pattern.test(mallName));
}

export function isBoostedMall(mallName: string | undefined | null): boolean {
  if (!mallName) return false;
  return BOOST_PATTERNS.some((pattern) => pattern.test(mallName));
}
