"use client";

import { useMemo } from "react";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type {
  Topology,
  Objects,
  GeometryObject,
} from "topojson-specification";
import type { Feature, FeatureCollection } from "geojson";

import landTopo from "world-atlas/land-110m.json";
import { getCityPieceCount, type City } from "@/lib/cities";

type WorldMapProps = {
  cities: readonly City[];
  activeSlug?: string;
  onSelectCity?: (slug: string) => void;
  /** SVG viewBox 가로 (세로는 비율로 자동). 기본 980. */
  width?: number;
  /** 마커 크기 배율 (도시 piece 수에 따라 조정). 기본 1. */
  markerScale?: number;
  /** 도시 라벨 노출 여부 (모바일은 좁아서 끌 수도 있음). 기본 true. */
  showLabels?: boolean;
};

/**
 * 매거진 톤의 흑백 윤곽선 세계 지도.
 *
 * - Natural Earth 110m TopoJSON(55KB) → topojson-client로 GeoJSON 변환.
 * - d3-geo의 Natural Earth 1 projection으로 매거진식 살짝 곡면진 outline.
 * - 대륙 outline만 (countries 국경 X) — quiet luxury 매거진 톤.
 * - 도시는 좌표를 projection으로 변환한 후 SVG circle + Playfair italic 라벨.
 * - active 도시는 ring(둘레 원)으로 강조 + 라벨 굵게.
 */
export function WorldMap({
  cities,
  activeSlug,
  onSelectCity,
  width = 980,
  markerScale = 1,
  showLabels = true,
}: WorldMapProps) {
  const { pathString, projectedCities, viewHeight } = useMemo(() => {
    const land = feature(
      landTopo as unknown as Topology<Objects<GeometryObject>>,
      (landTopo as unknown as Topology<Objects<GeometryObject>>).objects.land
    ) as Feature | FeatureCollection;

    // Natural Earth 1 — 매거진 atlas에서 가장 보편적인 projection.
    // fitSize로 viewBox 자동 맞춤.
    const aspect = 0.55; // Natural Earth 1 가로:세로 ≈ 1.85:1
    const height = Math.round(width * aspect);
    const projection = geoNaturalEarth1().fitSize(
      [width, height],
      land
    );
    const path = geoPath(projection);
    const d = path(land) ?? "";

    const projected = cities.map((city) => {
      const xy = projection(city.coords);
      return {
        city,
        x: xy?.[0] ?? 0,
        y: xy?.[1] ?? 0,
      };
    });

    return {
      pathString: d,
      projectedCities: projected,
      viewHeight: height,
    };
  }, [cities, width]);

  return (
    <svg
      viewBox={`0 0 ${width} ${viewHeight}`}
      role="img"
      aria-label="Global atlas"
      className="h-auto w-full select-none"
    >
      {/* 대륙 윤곽선 — 가는 잉크 라인 */}
      <path
        d={pathString}
        fill="none"
        stroke="currentColor"
        strokeWidth={0.7}
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.75}
      />

      {/* 도시 마커 + 라벨 */}
      {projectedCities.map(({ city, x, y }) => {
        const active = city.slug === activeSlug;
        const radius =
          (active ? 4.5 : 3) *
          markerScale *
          // 브랜드 수에 따라 살짝 가중 (5개 이상이면 0.5px 더 크게)
          (city.brandSlugs.length >= 5 ? 1.15 : 1);

        return (
          <g
            key={city.slug}
            className="cursor-pointer"
            onClick={() => onSelectCity?.(city.slug)}
            role="button"
            aria-label={`${city.displayName} edit`}
          >
            {/* 호버/선택 hit area */}
            <circle cx={x} cy={y} r={14} fill="transparent" />

            {/* active ring */}
            {active && (
              <circle
                cx={x}
                cy={y}
                r={radius + 4}
                fill="none"
                stroke="currentColor"
                strokeWidth={0.8}
                opacity={0.55}
              />
            )}

            {/* 잉크 점 */}
            <circle
              cx={x}
              cy={y}
              r={radius}
              fill="currentColor"
              className="transition-[r] duration-200"
            />

            {/* 라벨 (italic Playfair) + piece 수 superscript */}
            {showLabels && (
              <CityLabel
                x={x}
                y={y}
                city={city}
                active={active}
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function CityLabel({
  x,
  y,
  city,
  active,
}: {
  x: number;
  y: number;
  city: City;
  active: boolean;
}) {
  // 도시별 라벨 오프셋 — 마커와 겹치지 않도록 도시별 미세 조정.
  const offset = LABEL_OFFSETS[city.slug] ?? { dx: 8, dy: 4 };
  const pieceCount = getCityPieceCount(city.slug);

  return (
    <g
      transform={`translate(${x + offset.dx}, ${y + offset.dy})`}
      className="pointer-events-none"
    >
      <text
        x={0}
        y={0}
        fontFamily="var(--font-headline)"
        fontStyle="italic"
        fontSize={active ? 13 : 12}
        fontWeight={active ? 600 : 400}
        fill="currentColor"
      >
        {city.displayName}
        <tspan
          fontSize={8}
          dy={-4}
          dx={2}
          fontStyle="normal"
          fontFamily="var(--font-body)"
          opacity={0.7}
        >
          {pieceCount}
        </tspan>
      </text>
    </g>
  );
}

/** 도시별 라벨 위치 미세 조정 — 라벨이 다른 도시 마커나 대륙 외곽에
 *  겹치지 않도록 +x/+y 오프셋. 단위: SVG 유닛.
 *  Natural Earth 1 projection 기준으로 손튜닝. */
const LABEL_OFFSETS: Record<string, { dx: number; dy: number }> = {
  paris: { dx: 8, dy: 4 }, // 마커 오른쪽 약간 아래
  milan: { dx: 8, dy: 14 }, // 파리 라벨과 안 겹치게 더 아래로
  london: { dx: -56, dy: -6 }, // 마커 왼쪽 (Atlantic 위)
  "new-york": { dx: -72, dy: 4 }, // 마커 왼쪽
  tokyo: { dx: 10, dy: 8 },
  seoul: { dx: -58, dy: -6 }, // 마커 왼쪽 위
  copenhagen: { dx: 10, dy: -10 }, // 마커 오른쪽 위 (파리와 분리)
};
