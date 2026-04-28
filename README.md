# fassionmap

네이버 쇼핑 Open API 기반 **에디토리얼 패션 큐레이션 서비스**.
SSENSE / MATCHES FASHION 류의 부티크 스타일 UI를 레퍼런스 삼아, 흩어져 있는 패션 상품 데이터를 잡지처럼 큐레이션해서 보여주는 것을 목표로 합니다.

> Next.js 16 · React 19 · Tailwind v4 기반의 개인 포트폴리오 프로젝트입니다.

---

## 주요 기능

- **에디토리얼 홈** — 시즌/이슈 단위로 묶인 큐레이션 섹션 + 히어로 커버 + 티커
- **브랜드 인덱스** — 브랜드 단위로 정규화된 카탈로그 진입점
- **검색** — 정렬 옵션(정확도/최신/가격) + 무한 스크롤, URL 동기화
- **피드 / Discover** — 팔로잉 기반 피드 + 발견 탭
- **저장 (Saved)** — 관심 상품 보관
- **The Atlas (preview)** — d3-geo + world-atlas 기반의 "패션이 만들어지는 곳"을 보여주는 지도 시각화 (개발 중)
- **상품 상세** — 네이버 쇼핑 어필리에이트 링크로 연결

---

## 기술 스택

| 영역 | 사용 기술 |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript 5 |
| 지도 시각화 | d3-geo, topojson-client, world-atlas |
| 외부 API | [Naver Shopping Search API](https://developers.naver.com/docs/serviceapi/search/shopping/shopping.md) |
| Lint | ESLint 9 + `eslint-config-next` |

---

## 로컬 실행 방법

### 1. 저장소 클론 및 의존성 설치

```bash
git clone https://github.com/kwiss22/fassionmap-v2.git
cd fassionmap-v2
npm install
```

### 2. 네이버 검색 API 키 발급

1. [Naver Developers](https://developers.naver.com/apps/#/list) 접속 후 로그인
2. **애플리케이션 등록** → 사용 API에서 **검색** 선택
3. 환경에 **WEB 설정** 추가 (`http://localhost:3000`)
4. 발급된 **Client ID / Client Secret** 확인

### 3. 환경 변수 설정

```bash
# PowerShell
Copy-Item .env.local.example .env.local

# bash / zsh
cp .env.local.example .env.local
```

`.env.local` 을 열어 발급받은 키를 입력합니다.

```env
NAVER_CLIENT_ID=발급받은_client_id
NAVER_CLIENT_SECRET=발급받은_client_secret
```

> `.env.local` 은 `.gitignore` 에 의해 **절대 커밋되지 않습니다.**
> 템플릿인 `.env.local.example` 만 저장소에 포함됩니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 으로 접속.

---

## 사용 가능한 스크립트

| 명령어 | 설명 |
|---|---|
| `npm run dev` | 개발 서버 실행 (Turbopack) |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 프로덕션 서버 실행 |
| `npm run lint` | ESLint 실행 |

---

## 프로젝트 구조 (요약)

```
app/
  page.tsx              # 에디토리얼 홈
  search/               # 검색 + 무한 스크롤
  feed/                 # 팔로잉 피드 + Discover
  saved/                # 저장한 상품
  me/                   # 사용자 페이지
  product/              # 상품 상세
  atlas-preview/        # The Atlas 지도 프리뷰
  api/
    naver-products/     # 네이버 쇼핑 검색 프록시
    diag/               # 개발용 진단 라우트 (production 차단)
components/
  home/                 # 히어로, 티커, 에디토리얼 섹션, 브랜드 인덱스
  feed/                 # 피드 / Discover 컴포넌트
  layout/               # TopBar 등 공용 레이아웃
lib/
  api.ts                # 네이버 쇼핑 API 클라이언트 + 정렬/페이지네이션
  brands.ts             # 브랜드 정규화 / 매핑 로직
  product.ts            # 상품 도메인 모델
  editorial.ts          # 에디토리얼 이슈/섹션 정의
  hooks/                # 데이터 페칭 훅
scripts/                # 로컬 진단/프로빙 스크립트 (dev only)
```

---

## 보안 / 운영 메모

- **API 키는 모두 `process.env` 로만 접근**합니다 — 코드에 하드코딩된 키 없음.
- **개발용 진단 라우트** (`/api/diag/*`) 는 `NODE_ENV === "production"` 일 때 자동 차단됩니다.
- `.gitignore` 에 `.env*` 가 **첫 커밋부터 적용**되어 있어 키가 git history 에 포함된 적 없습니다.

---

## 라이선스 / 사용 안내

이 저장소는 **개인 포트폴리오 목적**으로 공개되어 있습니다.
상업적 재배포는 의도하지 않으며, 코드 리뷰/참고 용도로 자유롭게 열람하셔도 좋습니다.
