<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 패션맵 v2 — 작업 규칙

이 저장소에서 코드를 작성하거나 수정할 때 반드시 따라야 하는 규칙. PRD(`docs/PRD.md`)를 먼저 읽고 시작할 것.

> **이 프로젝트는 학습·포트폴리오용**. 진짜 서비스 론칭이나 수익화 목표 없음. 작업 결정도 그 관점에서.

---

## A. 환경 / 스택

- **Next.js 16 (App Router) + React 19 + Tailwind v4 + TypeScript 5**
- 셋 다 LLM 학습 데이터에 거의 없는 최신 버전. **모르겠으면 `node_modules/next/dist/docs/` 또는 공식 문서 확인.** 추측으로 옛 패턴(예: `pages/`, `getServerSideProps`, 옛 `metadata` API, Tailwind v3 형식 config) 사용 금지.
- 패키지 매니저는 `package.json`에 정의된 것 따름 (현재 npm).

## B. 보안 / 비밀

1. **모든 외부 API 키는 서버 전용**. 절대 클라이언트 번들에 노출 X.
   - `process.env.X` 형태로만 접근. `NEXT_PUBLIC_X` 사용 금지 (해당 키 한정).
2. **`.env.local`은 절대 커밋 X.** `.env.local.example`에 키 이름만 등록.
3. **개발용 진단 라우트** (`/api/diag/*`)는 `NODE_ENV === "production"`일 때 자동 차단 — 이 패턴 유지.
4. AI 호출도 모두 서버 라우트 (`app/api/ai/*`) 경유. 클라이언트에서 직접 SDK 호출 금지.

현재 키 목록:
- `NAVER_CLIENT_ID`, `NAVER_CLIENT_SECRET` (이미 사용 중)
- `GOOGLE_AI_API_KEY` (Gemini, Sprint 1에서 추가)
- `LLM_PROVIDER` (값: `gemini` / `mock`)

## C. AI 작업 규칙 (LLM 통합 코드 작성 시)

이 규칙들이 *학습 목표의 핵심*. 우회하면 학습 가치 사라짐.

1. **Provider 추상화 필수**. 직접 `@google/generative-ai` SDK를 컴포넌트나 임의 위치에서 import 금지.
   - 단일 진입점: `lib/ai/client.ts`의 `getLLMProvider()` 헬퍼
   - 인터페이스: `LLMProvider` (정의는 `lib/ai/types.ts`)
   - 환경변수 `LLM_PROVIDER`로 gemini / mock 선택
   - SDK 직접 import는 `lib/ai/providers/gemini.ts` **안에서만**
2. **출력은 항상 Zod로 검증**. LLM 응답을 그대로 신뢰 X. 검증 실패 시 1회 retry, 그래도 실패면 fallback.
3. **Gemini Structured Output 활용**: `responseSchema` 옵션으로 JSON 강제. Zod 검증과 이중 안전망.
4. **비용 가드**:
   - 같은 입력 hash → 결과 24h 캐싱 (`lib/ai/cache.ts`)
   - 무한 재시도 금지. 최대 1회.
   - 토큰 상한 명시 (`maxOutputTokens` 항상 설정)
   - 일일 호출 카운트 가드 (개발 중 무한루프 방지)
5. **프롬프트는 분리**: 컴포넌트나 라우트에 인라인 X. `lib/ai/prompts/*.ts`에 함수로.
6. **MockProvider 우선 개발**. 실 API 호출은 통합 마지막 단계에. 개발 중에는 `LLM_PROVIDER=mock`.

## D. UI / 카피 규칙

1. **한글 카피는 컴포넌트에 인라인 OK** (학습 프로젝트라 i18n 구조 안 도입).
2. **AI 큐레이션 표시는 `AIChip` 컴포넌트로** (이미 존재). 챗 풍선·로봇 이모지 X.
3. **상품 카드는 기존 `ProductCard` 재사용**.
4. **서버 컴포넌트 우선**, 인터랙션 필요할 때만 `"use client"`.

## E. 데이터 / 모델

1. **상품 모델은 `Product` 타입 (`lib/product.ts`) 단일**. AI 출력도 결국 이 타입으로 매핑.
2. **이슈 모델은 `EditorialIssue` 타입 (`lib/editorial.ts`) 단일**.
3. **유저 데이터(saved/follow)는 localStorage**. 서버 전송 X.
4. **이슈 데이터는 `data/issues/*.json`**. 새 이슈 발행 시 파일 추가.

## F. 정책 필터 (절대 우회 X)

- `lib/mall-policy.ts`: 블록 몰 / 부스트 몰 정책
- `lib/listing-guard.ts`: 도매·낚시 상품 거름
- `lib/title-sanitize.ts`: 타이틀 정제 + dedupe fingerprint
- AI가 만든 어떤 결과든 결국 `fetchNaverProductsPage`를 통과 → 정책 필터 자동 적용. **이 흐름 깨지 않기.**

## G. Git 위생

- `.env*` 절대 커밋 X (`.gitignore` 첫 커밋부터 적용 중)
- AI 출력 캐시 / 이슈 JSON은 커밋 (정적 콘텐츠 취급)
- 임시 진단 파일 (`bag-resp.json` 등) → 정리 권장 (시간 남으면)

## H. 학습 프로젝트 운영 룰

이 프로젝트가 무한 늘어나지 않게:

1. **Sprint 1 → 1.5주 넘으면 무조건 멈춤**
2. **PRD 5장 "하지 않는 것" 목록 절대 추가 X** (챗 인터페이스, 사진 분석, 인증 등)
3. **새 라이브러리 추가는 의심부터** — 진짜 필요한지 1개씩 정당화
4. **재미 없어지면 멈춤**

## I. 새 작업 시작 시 체크리스트

- [ ] 본 문서(AGENTS.md) 읽음
- [ ] PRD 해당 Sprint 섹션 읽음
- [ ] SPRINTS.md 해당 Sprint의 작업 순서 확인
- [ ] 기존 비슷한 구현이 있는지 search
- [ ] 새 라이브러리 추가는 정말 필요한지 의심
- [ ] 비밀키 노출 가능성 점검
- [ ] 변경이 정책 필터·Provider 추상화를 우회하지 않는지 확인
