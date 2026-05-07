"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { CITIES, getCityBySlug, getCityPieceCount } from "@/lib/cities";
import { getBrandBySlug } from "@/lib/brands";
import { getAtlasCityCtaHref } from "@/lib/atlas-cta";

// d3-geo가 server/client에서 부동소수점 정밀도 차이로 path string 미세하게
// 다르게 만들어 hydration mismatch 발생 → client-only 렌더로 회피.
const WorldMap = dynamic(
  () => import("./WorldMap").then((m) => m.WorldMap),
  {
    ssr: false,
    loading: () => (
      <div
        aria-hidden
        className="aspect-[16/9] w-full animate-pulse bg-on-surface/[0.03]"
      />
    ),
  }
);

/**
 * Atlas — Fashionmap의 시그니처 섹션.
 *
 * "글로벌 큐레이션의 출처를 매거진 atlas 한 장으로 보여준다."
 *
 * 모바일: 헤드라인 → 지도 → 가로 도시 칩 → 선택된 도시 카드(아래로 풀림)
 * 데스크톱(lg+): 좌측 지도(2/3), 우측 도시 카드(1/3) 사이드 패널.
 *
 * 인터랙션: 지도의 도시 점, 칩, 키보드 모두 같은 activeCity 상태를 조작.
 */
export function AtlasSection({ defaultCitySlug = "paris" }: { defaultCitySlug?: string }) {
  const [activeSlug, setActiveSlug] = useState(defaultCitySlug);
  const activeCity = getCityBySlug(activeSlug) ?? CITIES[0];

  return (
    <section className="border-y border-outline-variant bg-surface-bright/40">
      <div className="px-5 pb-10 pt-12 lg:px-10 lg:pb-16 lg:pt-20">
        <div className="grid gap-x-12 gap-y-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* LEFT: 헤드라인 + 지도 + 칩 */}
          <div className="min-w-0">
            <p className="eyebrow">
              GLOBAL EDIT · ATLAS · SS26
            </p>
            <h2 className="editorial-display mt-3 text-[44px] leading-[1.0] sm:text-[60px] lg:text-[80px]">
              Where fashion
              <br />
              <span className="italic">is being made.</span>
            </h2>
            <p className="mt-4 max-w-md text-[14px] text-on-surface-variant">
              이번 주, {CITIES.length}개 도시에서. 점을 눌러 그 도시의 큐레이션을
              펼쳐보세요.
            </p>

            {/* 지도 */}
            <div className="mt-8 text-on-surface lg:mt-10">
              <WorldMap
                cities={CITIES}
                activeSlug={activeSlug}
                onSelectCity={setActiveSlug}
              />
            </div>

            {/* 도시 칩 row — 모바일에서 가로 스크롤 */}
            <div className="hide-scrollbar mt-6 -mx-5 overflow-x-auto px-5 lg:mx-0 lg:px-0">
              <ul className="flex gap-2 lg:flex-wrap">
                {CITIES.map((city) => {
                  const active = city.slug === activeSlug;
                  const pieceCount = getCityPieceCount(city.slug);
                  return (
                    <li key={city.slug}>
                      <button
                        type="button"
                        onClick={() => setActiveSlug(city.slug)}
                        aria-pressed={active}
                        className={
                          "flex items-center gap-2 whitespace-nowrap border px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] uppercase transition-colors " +
                          (active
                            ? "border-on-surface bg-on-surface text-on-primary-container"
                            : "border-outline-variant text-on-surface hover:border-on-surface")
                        }
                      >
                        <span>{city.displayName}</span>
                        <span
                          className={
                            "tabular-nums " +
                            (active ? "opacity-80" : "opacity-60")
                          }
                        >
                          {pieceCount}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* RIGHT: 도시 사이드 panel (데스크톱) / 아래 카드 (모바일) */}
          <CityPanel city={activeCity} />
        </div>
      </div>
    </section>
  );
}

function AtlasCityCta({ citySlug, label }: { citySlug: string; label: string }) {
  const href = getAtlasCityCtaHref(citySlug);
  const className =
    "mt-7 inline-flex h-11 w-full items-center justify-center border border-on-surface text-[12px] font-medium tracking-[0.22em] uppercase transition-colors hover:bg-on-surface hover:text-on-primary-container";

  if (href.startsWith("#")) {
    return (
      <a href={href} className={className}>
        View {label} Edit &rarr;
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      View {label} Edit &rarr;
    </Link>
  );
}

function CityPanel({ city }: { city: ReturnType<typeof getCityBySlug> }) {
  if (!city) return null;
  const pieceCount = getCityPieceCount(city.slug);
  const brands = city.brandSlugs
    .map((slug) => getBrandBySlug(slug))
    .filter((b): b is NonNullable<typeof b> => Boolean(b));
  const featured = brands.slice(0, 4);

  return (
    <aside className="border-l-0 border-outline-variant pt-2 lg:border-l lg:pl-10 lg:pt-0">
      <p className="eyebrow">FROM</p>
      <h3 className="editorial-display mt-1 text-[56px] leading-none lg:text-[76px]">
        {city.displayName}
      </h3>
      <p className="mt-3 text-[12px] tracking-[0.18em] text-on-surface-variant uppercase">
        {brands.length}&nbsp;maisons &middot; {pieceCount}&nbsp;pieces &middot; SS26&nbsp;edit
      </p>

      <p className="mt-5 text-[14px] leading-[1.65] text-on-surface">
        {city.intro}
      </p>

      {/* 대표 메종 4개 — 미니 그리드 (이미지 placeholder + 이름) */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        {featured.map((brand) => (
          <div key={brand.slug} className="group">
            <div className="silhouette-bg relative aspect-[4/5] overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center text-[10px] tracking-[0.2em] text-on-surface-variant uppercase">
                {brand.displayEn}
              </span>
            </div>
            <p className="mt-2 text-[10px] tracking-[0.2em] text-on-surface uppercase">
              {brand.displayEn}
            </p>
            <p className="text-[12px] text-on-surface-variant">
              SS26 piece
            </p>
          </div>
        ))}
      </div>

      {/* CTA — 홈 이슈 브랜드 섹션 앵커 또는 검색 */}
      <AtlasCityCta citySlug={city.slug} label={city.displayName} />
    </aside>
  );
}
