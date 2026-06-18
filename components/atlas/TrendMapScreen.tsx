"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  TREND_MAP_CITIES,
  TREND_MAP_LAND_PATHS,
  getTrendCityExploreHref,
  type TrendMapCity,
} from "@/lib/trend-map-data";

export function TrendMapScreen() {
  const [selCity, setSelCity] = useState<TrendMapCity | null>(
    TREND_MAP_CITIES[0] ?? null
  );
  const [scanLine, setScanLine] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setScanLine((v) => (v + 1) % 200), 18);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col overflow-hidden bg-[#060a08] text-[#e8f0eb]">
      <header className="flex shrink-0 items-center justify-between border-b border-[rgba(57,255,122,0.08)] px-5 pb-3 pt-2">
        <div>
          <div className="mb-0.5 flex items-center gap-1">
            <GlobeIcon />
            <span className="font-mono text-[7px] uppercase tracking-[0.18em] text-[var(--color-neon)]">
              Fashionmap · Atlas
            </span>
          </div>
          <h1 className="display-caps text-xl text-[#e8f0eb]">Trend Map</h1>
        </div>
        <div className="inline-flex items-center gap-1 rounded-full border border-[rgba(57,255,122,0.18)] bg-[rgba(57,255,122,0.08)] px-2.5 py-1.5">
          <span
            className="h-[5px] w-[5px] rounded-full bg-[var(--color-neon)] shadow-[0_0_6px_var(--color-neon)]"
            aria-hidden
          />
          <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[var(--color-neon)]">
            Live
          </span>
        </div>
      </header>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <svg
          viewBox="0 0 350 200"
          className="block h-full w-full"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label="World trend map"
        >
          <defs>
            <radialGradient id="atlas-vignette" cx="50%" cy="50%" r="70%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="100%" stopColor="#060a08" stopOpacity="0.65" />
            </radialGradient>
          </defs>
          <rect width="350" height="200" fill="#060d09" />
          {[20, 40, 60, 80, 100, 120, 140, 160].map((y) => (
            <line
              key={`h-${y}`}
              x1="0"
              y1={y}
              x2="350"
              y2={y}
              stroke="#39ff7a"
              strokeWidth="0.2"
              opacity="0.07"
            />
          ))}
          {[35, 70, 105, 140, 175, 210, 245, 280, 315].map((x) => (
            <line
              key={`v-${x}`}
              x1={x}
              y1="0"
              x2={x}
              y2="200"
              stroke="#39ff7a"
              strokeWidth="0.2"
              opacity="0.07"
            />
          ))}
          <line
            x1="0"
            y1="100"
            x2="350"
            y2="100"
            stroke="#39ff7a"
            strokeWidth="0.5"
            opacity="0.18"
            strokeDasharray="3,4"
          />
          <line
            x1="175"
            y1="0"
            x2="175"
            y2="200"
            stroke="#39ff7a"
            strokeWidth="0.5"
            opacity="0.12"
            strokeDasharray="3,4"
          />
          {TREND_MAP_LAND_PATHS.map((d, i) => (
            <path
              key={i}
              d={d}
              fill="#0f1a12"
              stroke="#1e3022"
              strokeWidth="0.6"
            />
          ))}
          <line
            x1="0"
            y1={scanLine}
            x2="350"
            y2={scanLine}
            stroke="#39ff7a"
            strokeWidth="0.4"
            opacity="0.1"
          />
          {TREND_MAP_CITIES.map((city) => (
            <MapCityMarker
              key={city.id}
              city={city}
              selected={selCity?.id === city.id}
              onSelect={() =>
                setSelCity((prev) => (prev?.id === city.id ? null : city))
              }
            />
          ))}
          <rect width="350" height="200" fill="url(#atlas-vignette)" />
        </svg>
      </div>

      <AnimatePresence mode="wait">
        {selCity ? (
          <TrendCityPanel
            key={selCity.id}
            city={selCity}
            onClose={() => setSelCity(null)}
          />
        ) : null}
      </AnimatePresence>

      {!selCity && <div className="h-20 shrink-0" aria-hidden />}
    </div>
  );
}

function MapCityMarker({
  city,
  selected,
  onSelect,
}: {
  city: TrendMapCity;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`${city.name}, ${city.trend}`}
      aria-pressed={selected}
      className="cursor-pointer outline-none"
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      <circle
        cx={city.x}
        cy={city.y}
        r="12"
        fill="none"
        stroke={city.neon}
        strokeWidth="0.5"
        opacity="0"
      >
        <animate
          attributeName="r"
          values="6;14;6"
          dur="2.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.4;0;0.4"
          dur="2.5s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={city.x}
        cy={city.y}
        r="9"
        fill="none"
        stroke={city.neon}
        strokeWidth="0.8"
        opacity="0"
      >
        <animate
          attributeName="r"
          values="4;10;4"
          dur="2.5s"
          begin="0.4s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.5;0;0.5"
          dur="2.5s"
          begin="0.4s"
          repeatCount="indefinite"
        />
      </circle>
      <circle
        cx={city.x}
        cy={city.y}
        r={selected ? 4 : 3}
        fill={city.neon}
        opacity={selected ? 1 : 0.85}
        style={{
          filter: `drop-shadow(0 0 ${selected ? 5 : 3}px ${city.neon})`,
        }}
      />
      {selected && (
        <text
          x={city.x + 6}
          y={city.y - 5}
          fill={city.neon}
          fontSize="4.5"
          fontFamily="Geist Mono, ui-monospace, monospace"
          fontWeight="500"
          style={{ filter: `drop-shadow(0 0 3px ${city.neon})` }}
        >
          {city.name.toUpperCase()}
        </text>
      )}
    </g>
  );
}

function TrendCityPanel({
  city,
  onClose,
}: {
  city: TrendMapCity;
  onClose: () => void;
}) {
  const exploreHref = getTrendCityExploreHref(city);

  return (
    <motion.div
      initial={{ y: 220, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 220, opacity: 0 }}
      transition={{ type: "spring", stiffness: 340, damping: 32 }}
      className="relative shrink-0 overflow-hidden border-t bg-[#0a1009] px-5 pb-20 pt-3.5"
      style={{ borderTopColor: `${city.neon}30` }}
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5"
        style={{
          backgroundImage: `linear-gradient(90deg, transparent, ${city.neon}, transparent)`,
        }}
        aria-hidden
      />

      <div className="mb-2 flex items-start justify-between">
        <div>
          <div className="mb-0.5 flex items-center gap-1">
            <MapPinIcon color={city.neon} />
            <span
              className="font-mono text-[8px] uppercase tracking-[0.14em]"
              style={{ color: city.neon }}
            >
              {city.country}
            </span>
          </div>
          <h2 className="display-caps text-lg text-[#e8f0eb]">{city.name}</h2>
          <p
            className="font-[family-name:var(--font-rajdhani)] text-[13px] tracking-wide"
            style={{ color: city.neon }}
          >
            {city.trend}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close city panel"
            className="flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.05)]"
          >
            <CloseIcon />
          </button>
          <div className="inline-flex items-center gap-0.5 rounded-full border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.04)] px-1.5 py-0.5">
            <FlameIcon />
            <span className="font-mono text-[8px] text-[#ff6a3c]">
              {city.heat}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-2.5 flex flex-wrap gap-1">
        {city.tags.map((tag) => (
          <span
            key={tag}
            className="rounded border px-2 py-0.5 font-mono text-[8px] tracking-[0.08em]"
            style={{
              color: city.neon,
              backgroundColor: `${city.neon}12`,
              borderColor: `${city.neon}28`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <div className="flex flex-1 gap-1">
          {city.thumbs.map((src, i) => (
            <div
              key={i}
              className="relative h-[60px] flex-1 overflow-hidden rounded-md border bg-[#111a13]"
              style={{ borderColor: `${city.neon}18` }}
            >
              <Image
                src={src}
                alt=""
                fill
                className="object-cover"
                sizes="33vw"
              />
            </div>
          ))}
        </div>
        <Link
          href={exploreHref}
          className="inline-flex shrink-0 items-center gap-0.5 rounded-md border-0 px-2.5 py-2"
          style={{ backgroundColor: city.neon }}
        >
          <span className="whitespace-nowrap font-mono text-[8px] font-semibold tracking-[0.06em] text-[#060a08]">
            Explore
          </span>
          <ChevronRightIcon />
        </Link>
      </div>

      <div className="mt-2 flex items-center gap-1 border-t border-[rgba(255,255,255,0.04)] pt-2">
        <TrendingIcon />
        <span className="font-mono text-[8px] tracking-[0.08em] text-[var(--color-neon)]">
          {city.stat}
        </span>
        <span className="ml-auto font-mono text-[7px] tracking-[0.06em] text-[#1e3022]">
          ATLAS · LIVE
        </span>
      </div>
    </motion.div>
  );
}

function GlobeIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="#39ff7a" strokeWidth="2" />
      <path
        d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"
        stroke="#39ff7a"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function MapPinIcon({ color }: { color: string }) {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s6-5.5 6-11a6 6 0 1 0-12 0c0 5.5 6 11 6 11Z"
        stroke={color}
        strokeWidth="2"
      />
      <circle cx="12" cy="10" r="2" fill={color} />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="#3a5040"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 22c4-3 7-7 7-11a7 7 0 0 0-14 0c0 4 3 8 7 11Z"
        fill="#ff6a3c"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 6l6 6-6 6"
        stroke="#060a08"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendingIcon() {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 16l6-6 4 4 6-8"
        stroke="#39ff7a"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
