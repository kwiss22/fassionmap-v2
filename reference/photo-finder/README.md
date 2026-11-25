# FashionMap 사진 검색 — Claude 인수인계용 참조 코드

2026-11-25 기준 별도 Sites 환경에서 작업한 소스 스냅샷입니다. 기존 Next.js 앱과 통합되지 않는 독립 참조 폴더입니다. 루트 앱·의존성·API·배포 설정은 변경하지 않았습니다.

먼저 [HANDOFF.md](HANDOFF.md)를 읽으세요. 일반 Gemini 웹보다 정확하거나 빠르다고 검증되지 않았으며, 서비스 출시 완성본이 아닙니다.

## 활성 흐름

사진 업로드 → 의류 영역 선택 → Gemini에 이미지와 Google 검색 도구를 **한 번의 요청으로 전달** → 제품명·링크 추출 → 즉시 결과 표시 → 별도 HTTP 요청으로 미리보기 수집.

- `POST /api/find`: `{image: "data:image/jpeg;base64,...", context?: string, mode?: "identify" | "alternatives"}`
- `POST /api/previews`: `{products: [{id, url}]}`. 승인된 공개 판매처에만 접근하며 AI를 호출하지 않습니다.
- 유사 추천은 사용자가 선택할 때만 요청합니다.
- 카드 추출 실패 시 `rawResponse`를 보존합니다. 키가 없으면 `503 not_configured`를 반환합니다.
- 가격·재고·배송·정품·정확도 퍼센트를 검증한 서비스가 아닙니다.

## 파일 안내

| 위치 | 역할 |
|---|---|
| `photo-web/` | 현재 업로드·영역 선택·분석·결과 화면 |
| `server/finder.js` | 활성 Gemini 단일 요청·프롬프트·응답 추출 |
| `server/previews.js` | 판매 페이지 OG 이미지 수집 |
| `scripts/build.mjs` | 프런트엔드를 포함한 Worker ESM 빌드 |
| `web/` 및 기타 `server/` | 이전 MVP 보존 소스. 현재 UI에서 사용하지 않는 코드 포함 |
| `server/catalog.js`, `recommendations.js`, `visual.js` | 제휴·추천·이미지 비교 실험. 현재 검색에서 자동 실행하지 않음 |

## 실행과 검증

외부 패키지 설치 없이 Node.js 22 이상에서:

```sh
cd reference/photo-finder
npm test
npm run build
node scripts/dev.mjs
# http://localhost:4173
```

`dist/server/index.js`는 `{fetch(request, env)}`를 default export하는 Worker입니다. Next.js 페이지가 아니므로 `next dev`로 이 폴더를 직접 실행할 수 없습니다. 로컬 서버는 `127.0.0.1`에만 열립니다.

키는 셸 비밀값으로 `GEMINI_API_KEY`를 설정하고, 필요하면 `GEMINI_MODEL`을 지정하세요. `env.template`에는 변수 이름만 있습니다. `.env` 파일을 자동으로 읽지는 않습니다. 기존 Next.js의 `GOOGLE_AI_API_KEY`와 이름이 다르므로 통합 시 서버 안에서만 매핑하세요.

Sites ID·실제 키·배포 인증정보·사용자 업로드 사진·실시간 API 응답 파일은 제외했습니다. 이 내보내기를 실행해도 기존 사이트가 배포되지 않습니다.
