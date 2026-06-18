import type { BodyFitId } from "@/lib/onboarding-preferences";

export function BodyFitIcon({ id, active }: { id: BodyFitId; active: boolean }) {
  const color = active ? "#111111" : "#d0d0d0";
  switch (id) {
    case "slim":
      return (
        <svg width="44" height="80" viewBox="0 0 44 80" fill="none" aria-hidden>
          <path d="M 15,3 Q 22,9 29,3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 5,11 L 15,3 L 29,3 L 39,11" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 5,11 L 2,27 L 9,28 L 13,14" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 39,11 L 42,27 L 35,28 L 31,14" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 13,14 L 11,68 L 33,68 L 31,14" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="11" y1="68" x2="33" y2="68" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <line x1="22" y1="12" x2="22" y2="46" stroke={color} strokeWidth="0.9" strokeLinecap="round" strokeDasharray="2 2.5" />
        </svg>
      );
    case "regular":
      return (
        <svg width="54" height="80" viewBox="0 0 54 80" fill="none" aria-hidden>
          <path d="M 19,3 Q 27,9.5 35,3" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 4,12 L 19,3 L 35,3 L 50,12" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 4,12 L 1,30 L 10,31 L 15,15" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 50,12 L 53,30 L 44,31 L 39,15" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 15,15 L 14,68 L 40,68 L 39,15" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="14" y1="68" x2="40" y2="68" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <line x1="27" y1="13" x2="27" y2="50" stroke={color} strokeWidth="0.9" strokeLinecap="round" strokeDasharray="2 2.5" />
        </svg>
      );
    case "oversized":
      return (
        <svg width="68" height="80" viewBox="0 0 68 80" fill="none" aria-hidden>
          <path d="M 23,4 Q 34,12 45,4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 3,17 L 23,4 L 45,4 L 65,17" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <path d="M 3,17 L 1,35 L 14,36 L 17,18" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 65,17 L 67,35 L 54,36 L 51,18" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 17,18 L 15,70 L 53,70 L 51,18" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="15" y1="70" x2="53" y2="70" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
          <line x1="34" y1="16" x2="34" y2="52" stroke={color} strokeWidth="0.9" strokeLinecap="round" strokeDasharray="2 2.5" />
        </svg>
      );
  }
}
