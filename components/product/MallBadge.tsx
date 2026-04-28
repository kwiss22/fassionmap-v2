import { Pill } from "@/components/ui/Pill";

/**
 * 상품 카드/상세에서 리테일러(몰)를 보여주는 작은 필.
 *
 * 시안에선 "NET-A-PORTER", "FARFETCH" 같은 글로벌 몰이 카드 하단 앵커로
 * 활용됨. mallName이 길거나 이모지가 섞여 있으면 대표 표기로 축약.
 */

const DISPLAY_OVERRIDES: Record<string, string> = {
  네타포르테: "NET-A-PORTER",
  "NET-A-PORTER": "NET-A-PORTER",
  "Net-a-Porter": "NET-A-PORTER",
  "net-a-porter": "NET-A-PORTER",
  파페치: "FARFETCH",
  FARFETCH: "FARFETCH",
  Farfetch: "FARFETCH",
  farfetch: "FARFETCH",
  W컨셉: "W CONCEPT",
  하프클럽: "HALFCLUB",
  머스트잇: "MUST-IT",
};

export function formatMallDisplay(mall: string): string {
  const trimmed = mall.trim();
  if (!trimmed) return "";
  const override = DISPLAY_OVERRIDES[trimmed];
  if (override) return override;
  // 한글 포함이면 그대로 (영문화 시도하지 않음)
  if (/[가-힣]/.test(trimmed)) return trimmed;
  return trimmed.toUpperCase();
}

export function MallBadge({
  mall,
  variant = "outline",
  className,
}: {
  mall: string;
  variant?: "outline" | "solid";
  className?: string;
}) {
  const display = formatMallDisplay(mall);
  if (!display) return null;
  return (
    <Pill variant={variant} className={className}>
      {display}
    </Pill>
  );
}
