# 패션맵 v2 — PRD (학습·포트폴리오)

## 제품 정체성

- **목적**: Next.js 16, React 19, Tailwind v4를 익히면서 만드는 **패션·쇼핑 지도/아틀라스** 학습 프로젝트.
- **성격**: 프로덕션 서비스가 아니라 **기술 스택·구조·AI 연동 패턴**을 보여 주는 포트폴리오용 코드베이스.

## 범위 (Scope)

### In scope

- App Router 기반 UI, 지도/아틀라스 뷰, 검색·피드 등 학습 목적에 맞는 기능.
- 서버에서만 호출하는 외부 API(예: 쇼핑/검색), 환경 변수로만 비밀 관리.
- `LLM_PROVIDER=mock` 기본값으로 로컬 개발; 실제 Gemini 등은 서버 전용 래퍼에서만.

### Out of scope (이 프로젝트에서 지양)

- 레거시 Next 패턴: `pages/` 전용 라우팅, `getServerSideProps` / `getStaticProps`를 새 코드에 도입.
- Tailwind v3 스타일 `tailwind.config.js` 단일 소스에 의존하는 옛 설정 패턴(프로젝트는 v4).
- 클라이언트 번들에 API 키 노출, `NEXT_PUBLIC_`로 비밀 키 주입.

## 성공 기준 (학습 관점)

- 문서(`PRD`, `AGENTS`, `SPRINTS`)와 Cursor 규칙을 따르며 스프린트 단위로 작은 단위 커밋.
- 새 의존성은 필요성을 한 줄이라도 정당화한 뒤 추가.
