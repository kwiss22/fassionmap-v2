/**
 * 홈 피드(매거진형) 섹션 정의.
 *
 * 2026-04 이후 **브랜드 중심 피드**로 전환.
 * 카테고리 키워드("캐시미어 니트") 대신 실제 글로벌 브랜드를 쿼리해서,
 * 각 섹션이 하나의 브랜드 스토어처럼 보이게 한다.
 *
 * 브랜드 마스터 리스트와 순서는 `lib/brands.ts`에서 관리한다.
 * 여기서는 `HomeFeedSectionDef` 인터페이스에 맞게 매핑만 해준다.
 *
 * - keyword: 네이버 API에 들어가는 쿼리 문자열 (Brand.query)
 * - labelEn: 섹션 헤더 큰 Newsreader italic 라벨 (영문 브랜드명)
 * - labelKo: 섹션 헤더 eyebrow 라벨 (한국어 브랜드명)
 */
import { resolveHomeBrands } from "./brands";

export type HomeFeedSectionDef = {
  keyword: string;
  labelEn: string;
  labelKo: string;
};

export const HOME_FEED_SECTIONS: readonly HomeFeedSectionDef[] =
  resolveHomeBrands().map((brand) => ({
    keyword: brand.query,
    labelEn: brand.displayEn,
    labelKo: brand.displayKo,
  }));

/** 섹션 하나당 한 번에 보여줄 카드 수. 데스크탑 4열 × 2행 = 8이 브랜드 피드엔 적당. */
export const HOME_FEED_SECTION_SIZE = 8;

/** 초기 마운트 시 바로 로드할 섹션 개수. */
export const HOME_FEED_INITIAL_SECTIONS = 2;
