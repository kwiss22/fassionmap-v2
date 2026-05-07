# 패션맵 v2 — Sprint 분해 (학습 프로젝트 버전)

> PRD 5장의 상세 버전. **2주짜리 학습 프로젝트로 압축.**
> 핵심 룰: *Sprint 1 끝나면 멈추고 재판단*. *1.5주 넘기면 무조건 멈춤*.

---

## Sprint 1 — AI 큐레이터 백엔드 (1주)

### 목표

Gemini에게 "매거진 에디터" 페르소나로 `EditorialIssue` JSON 한 개를 생성하게 만드는 **백엔드 파이프라인**. 이 단계에서는 화면에 변화 없음. CLI로 호출하면 검증된 JSON이 떨어지면 됨.

### 학습 가치 (이번 스프린트에서 손에 익힐 것)

| 기술 | 어디서 익히나 |
|---|---|
| LLM Provider 추상화 | `lib/ai/client.ts`, `providers/*.ts` |
| Zod 스키마 검증 | `lib/ai/schema.ts` |
| Structured Output | `providers/gemini.ts`의 `responseSchema` |
| 프롬프트 엔지니어링 | `lib/ai/prompts/issue-editor.ts` |
| Retry / Fallback | `lib/ai/curator.ts` |
| 비용 캐싱 | `lib/ai/cache.ts` |
| Server-only 마커 | API 라우트 셋업 |

### 산출물

```
lib/ai/
  types.ts             # LLMProvider, CurationInput, IssueDraft 타입
  client.ts            # getLLMProvider() — env 기반 분기
  providers/
    gemini.ts          # GeminiProvider 구현 (마지막에)
    mock.ts            # MockProvider — 고정 JSON 반환 (먼저)
  prompts/
    issue-editor.ts    # 매거진 에디터 페르소나 + few-shot
  schema.ts            # Zod: IssueDraftSchema (EditorialIssue 부분집합)
  curator.ts           # curateNewIssue(): 호출 + 검증 + retry
  cache.ts             # 입력 hash → 결과 24h 캐싱

app/api/ai/
  curate/route.ts      # POST: 컨텍스트 받음, IssueDraft 반환

scripts/
  test-curator.mjs     # CLI에서 curator 호출
```

### 작업 순서 (반드시 이 순서)

1. `lib/ai/types.ts` — 타입 먼저
2. `lib/ai/schema.ts` — Zod
3. `lib/ai/providers/mock.ts` — 가짜 provider
4. `lib/ai/client.ts` — 진입점
5. `lib/ai/prompts/issue-editor.ts` — 프롬프트
6. `lib/ai/curator.ts` — 본체
7. `lib/ai/cache.ts` — 캐싱
8. `scripts/test-curator.mjs` — CLI 테스트
9. `app/api/ai/curate/route.ts` — API 라우트
10. **마지막**: `lib/ai/providers/gemini.ts` + 실 호출

### 완료 조건 (DoD)

- [ ] `LLM_PROVIDER=mock npm run test:curator` → 고정 JSON 출력
- [ ] `LLM_PROVIDER=gemini` + 실 키 → Gemini로부터 검증 통과한 JSON 받음
- [ ] 같은 입력 2회 호출 시 캐시 히트
- [ ] 검증 실패 케이스 동작 확인
- [ ] **기존 홈 화면 동작에 영향 0**

### 멈춤 룰

- 1.5주 넘으면 무조건 멈춤
- types.ts 만드는 데 1일 넘게 걸리면 → 범위가 너무 큰 것. 스코프 축소
- Cursor가 옛 Next 패턴 (`pages/`, `getServerSideProps`)을 자꾸 쓰면 → AGENTS.md 다시 강조하고 그래도 안 되면 멈춤
- AI 응답 품질이 형편없어도 OK. 학습 목표는 *통합*이지 *결과 품질*이 아님

### Cursor 작업 프롬프트

```
@docs/PRD.md @AGENTS.md @docs/SPRINTS.md

Sprint 1 시작합니다. 학습 프로젝트로 진행 — 수익·사용자 목표 없음, 오직 AI 통합 production 사례 1개 완성.

진행 규칙:
1. 한 번에 파일 1개만 만들고 멈춰서 보여줄 것. 한꺼번에 갈기지 말기.
2. 새 코드 쓰기 전 관련 기존 파일 먼저 읽기:
   - lib/editorial.ts (생성할 출력의 모양)
   - lib/api.ts (정책 필터 — AI 출력이 결국 통과할 파이프)
   - lib/product.ts
3. AGENTS.md C(AI 작업 규칙) 절대 위반 금지:
   - Provider 추상화 (lib/ai/client.ts 진입점만)
   - @google/generative-ai SDK 직접 import는 providers/gemini.ts 안에서만
   - 출력은 Zod 검증 + Gemini responseSchema 이중 안전망
4. Next.js 16 + React 19 + Tailwind v4 — 옛 패턴 사용 금지. 의심스러우면 node_modules/next/dist/docs/ 확인.
5. MockProvider 먼저 만들어 파이프 동작 → 그 다음 GeminiProvider 연결.

작업 순서 (SPRINTS.md Sprint 1 참조):
1) lib/ai/types.ts
2) lib/ai/schema.ts
3) lib/ai/providers/mock.ts
4) lib/ai/client.ts
5) lib/ai/prompts/issue-editor.ts
6) lib/ai/curator.ts
7) lib/ai/cache.ts
8) scripts/test-curator.mjs
9) app/api/ai/curate/route.ts
10) (마지막) lib/ai/providers/gemini.ts

먼저 1번 파일 만들기 전에:
- 위 3개 기존 파일을 읽고 1-2줄 요약
- types.ts에 어떤 시그니처를 만들 건지 설명
- 그 다음 types.ts 작성

환경변수 (.env.local):
- GOOGLE_AI_API_KEY=... (이미 보유)
- LLM_PROVIDER=mock (개발 초기)
```

---

## Sprint 2 — 자동 발행 + 화면 반영 (1주)

### 목표

Sprint 1의 큐레이터 출력을 받아 **이슈를 파일로 영속화**하고 **`CURRENT_ISSUE`가 자동으로 최신 이슈를 가리키게** 한다. 화면에서 새 이슈가 갱신됨.

### 학습 가치

| 기술 | 어디서 익히나 |
|---|---|
| 파일 시스템 기반 콘텐츠 관리 | `data/issues/*.json` 패턴 |
| 마이그레이션 안전성 | 하드코딩 → 파일 변경 시 *화면 동일성* 검증 |
| Server Component 데이터 페칭 | `getCurrentIssue()` server-only |
| 운영 스크립트 | `publish-issue.mjs` |

### 산출물

```
data/issues/
  vol-007.json         # 기존 하드코딩 → 옮긴 것 (마이그레이션)
  vol-008.json         # AI 발행 첫 이슈

lib/
  editorial.ts         # 수정: getCurrentIssue() 함수 추가
  ai/
    publisher.ts       # publishIssue(): curator 호출 → 파일 저장
    cover-image.ts     # 커버 이미지 풀 (Unsplash editorial 큐레이션)

scripts/
  publish-issue.mjs    # `npm run publish:issue` 트리거

app/page.tsx           # 수정: CURRENT_ISSUE → getCurrentIssue() 호출
```

### 핵심 결정

- **이슈는 파일 시스템 + git 커밋**: 새 이슈 = 파일 추가 + push
- **`getCurrentIssue()` server-only**: vol 번호 가장 큰 파일 읽음
- **마이그레이션 검증 필수**: 하드코딩 → vol-007.json 옮긴 직후 *화면이 똑같은지* 확인. 다르면 즉시 롤백.
- **커버 이미지 환각 방지**: AI가 URL 직접 만들지 않게. 사전 검증된 풀에서 선택만.
- **자동 push 금지**: 사람이 보고 git commit. 학습 프로젝트라도 이 패턴 익히는 게 좋음.

### 완료 조건

- [ ] `data/issues/vol-007.json` = 현재 하드코딩과 1:1 동일
- [ ] 마이그레이션 후 화면 변화 0
- [ ] `npm run publish:issue` (mock) → vol-008.json 생성
- [ ] gemini provider로 실제 발행 1회 성공
- [ ] 발행 후 화면 새로고침 시 새 이슈로 바뀜

### Cursor 작업 프롬프트

(Sprint 1 완료 후 작성)

---

## Sprint 1 끝나면 — 재판단 체크리스트

Sprint 1 끝나면 *반드시 멈춰서* 이걸 점검:

1. **시간 가성비**: Sprint 1에 며칠 썼나? 학습 가치 충분히 받았나?
2. **재미**: 만들면서 즐거웠나? 의무감으로 했나?
3. **다음 학습 가치**: Sprint 2가 *추가로 더* 배울 게 있나? 아니면 비슷한 작업 반복인가?
4. **README 우선순위**: Sprint 2 만드는 것보다 *지금 README 잘 쓰는 게* 더 가치 있을 수도

체크 결과:
- 만족 + 재미 + 시간 OK → Sprint 2 진행
- 시간 낭비 느낌 → **Sprint 1까지로 마무리 + README 작성**. 이것도 성공.
- 더 이상 학습 가치 없음 → 마무리

**Sprint 1까지로 끝내는 건 실패가 아님.** *학습 가치를 받았는데 시간 가성비가 떨어지면 멈추는 판단력*도 면접 시그널.

---

## Sprint 2 끝나면 — 진짜 끝

- Sprint 3, 4는 *기본적으로 안 함*
- Sprint 2 끝나면 **README 작성에 시간 투자**
- README가 면접 재료의 80%

이 프로젝트의 진짜 종착지는 코드가 아니라 **README + git history**예요. 거기서 본인의 사고 과정·결정 근거가 드러납니다.
