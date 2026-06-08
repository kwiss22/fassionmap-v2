const DAILY_LIMIT = 40;

let dayKey = "";
let callCount = 0;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function assertAiDailyBudget(): void {
  const today = todayKey();
  if (dayKey !== today) {
    dayKey = today;
    callCount = 0;
  }
  if (callCount >= DAILY_LIMIT) {
    throw new Error(
      `AI 일일 호출 한도(${DAILY_LIMIT}회)에 도달했습니다. 내일 다시 시도하거나 LLM_PROVIDER=mock으로 개발하세요.`
    );
  }
  callCount += 1;
}
