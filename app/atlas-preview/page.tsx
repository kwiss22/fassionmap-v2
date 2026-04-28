import { TopBar } from "@/components/layout/TopBar";
import { AtlasSection } from "@/components/atlas/AtlasSection";

/**
 * Atlas 시그니처 섹션 미리보기 페이지.
 *
 * 본 통합(/) 전에 인터랙션과 톤을 검증하기 위한 임시 라우트.
 * - 호버/탭으로 도시 선택 → 사이드 패널/카드 갱신 확인
 * - 모바일/데스크톱 반응형 확인
 * - 매거진 흑백 윤곽선 톤 검증
 *
 * 검증 후 본 통합 시 이 페이지는 제거하거나 /atlas로 승격.
 */
export default function AtlasPreviewPage() {
  return (
    <main className="min-h-screen">
      <TopBar showStatusStrip={false} />

      <section className="px-5 pb-2 pt-8 lg:px-10 lg:pt-12">
        <p className="eyebrow">PREVIEW · ATLAS SIGNATURE</p>
        <h1 className="editorial-display mt-2 text-[28px] leading-tight lg:text-[40px]">
          시그니처 섹션 미리보기
        </h1>
        <p className="mt-2 max-w-xl text-[13px] text-on-surface-variant">
          홈에 들어갈 Atlas 섹션의 인터랙션을 미리 확인합니다. 도시 점이나 칩을
          눌러 활성 도시가 어떻게 바뀌는지 보세요. 본 통합 시 이 페이지는
          제거됩니다.
        </p>
      </section>

      <AtlasSection />

      <section className="px-5 py-10 text-[12px] text-on-surface-variant lg:px-10">
        <p className="eyebrow mb-2">NOTES</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            지도 outline은 Natural Earth 110m TopoJSON(55KB) +
            d3-geo&apos;s Natural Earth 1 projection.
          </li>
          <li>
            도시 좌표는 [longitude, latitude] 기준, lib/cities.ts에서 관리.
          </li>
          <li>
            piece 수는 현재 brandSlugs 기반 임시 계산식 (cities.ts의
            getCityPieceCount). 본 통합 시 실제 큐레이션 데이터로 교체.
          </li>
          <li>
            대표 메종 그리드는 이미지 placeholder. 본 통합 시 각 브랜드의 SS26
            대표 piece 이미지로 교체.
          </li>
        </ul>
      </section>
    </main>
  );
}
