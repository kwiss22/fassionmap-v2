<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## 패션맵 v2 (학습·포트폴리오)

작업 전 문서 순서: `docs/PRD.md` → `docs/SPRINTS.md` → 본 파일.

- **스택**: Next.js 16, React 19, Tailwind v4 (App Router). 레거시 `pages/`·`getServerSideProps`·Tailwind v3 전용 패턴 금지.
- **비밀**: API 키는 서버·환경 변수만. `NEXT_PUBLIC_`로 키 노출 금지. 클라이언트에서 `@google/generative-ai` 등 직접 import 금지 — 통합은 `lib/ai/providers/gemini.ts` 한 곳(추가 시).
- **의존성**: 새 패키지는 필요성을 정당화한 뒤 1개씩 추가.
