# Hongdae Travel — 갤러리형 블로그 개발 계획서

> **상태:** ✅ 구현 완료 (2026-07-11). 로컬 빌드/부팅 검증 및 초기 git 커밋 완료.
> 남은 외부 작업: GitHub push · Supabase 프로젝트 생성 · Cloudflare Pages 연결
> (아래 "외부 설정 단계" 참조).

## Context (배경)
"Hongdae Travel"을 주제로 한 **갤러리형 블로그**를 새로 만든다. 방문자는 홈에서
게시물을 갤러리(그리드) 형태로 훑어보고, 게시물을 열면 여러 장의 사진과 글을 본다.
**관리자만** Supabase Auth 로그인 후 게시물을 등록/수정/삭제하며, 사진은 **Supabase
Storage**에 업로드한다. UI 텍스트는 **영어**로 작성한다.

작업 디렉터리(`c:\Users\bravo\Desktop\test2-sohyun`)는 비어 있는 상태에서 시작했고
git 저장소도 아니었다. Supabase 프로젝트, GitHub 저장소, Cloudflare Pages 연결은 모두
생성 전 상태였다. 따라서 이 계획은 코드/설정/DB 스키마를 처음부터(greenfield) 구성한다.

## 확정된 결정사항 (사용자 확인 완료)
| 항목 | 결정 |
|------|------|
| 게시 권한 | 관리자만 — Supabase Auth 로그인 필요 |
| 이미지 등록 | Supabase Storage 업로드 |
| UI 언어 | 영어 |

## 기본 결정사항 (합리적 기본값)
- **언어**: JavaScript(JSX) — "기본 스택"에 맞춰 단순하게. 추후 TypeScript 전환 용이.
- **스타일링**: Tailwind CSS.
- **라우팅**: `react-router-dom` v6 (SPA).
- **갤러리 레이아웃**: CSS `columns` 기반 masonry.
- **이미지 뷰어**: 상세 페이지 라이트박스(클릭 확대, ←/→/ESC 키 지원).

---

## 기술 스택
- **프론트엔드**: React 18 + Vite
- **라우팅**: react-router-dom v6
- **스타일**: Tailwind CSS
- **백엔드/DB**: Supabase (Postgres + Auth + Storage)
- **클라이언트 SDK**: `@supabase/supabase-js`
- **배포**: Cloudflare Pages (GitHub 연동 자동 배포)
- **버전관리**: GitHub

---

## 데이터 모델 (Supabase Postgres)

### `posts` 테이블
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK (default `gen_random_uuid()`) | 게시물 ID |
| `title` | text NOT NULL | 제목 |
| `content` | text | 본문/설명 |
| `location` | text | 홍대 장소명 (선택) |
| `cover_image_url` | text | 대표(썸네일) 이미지 URL |
| `images` | text[] | 갤러리 이미지 URL 배열 (첫 번째가 커버) |
| `created_at` | timestamptz default `now()` | 작성일 |
| `updated_at` | timestamptz default `now()` | 수정일 (트리거로 자동 갱신) |

> MVP는 `images text[]`로 단순화. 이미지별 캡션/정렬이 필요해지면 `post_images`
> 정규화 테이블로 확장.

### `comments` 테이블 (댓글)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | 댓글 ID |
| `post_id` | uuid FK → `posts.id` (`on delete cascade`) | 대상 게시물 |
| `author_name` | text NOT NULL | 작성자 표시 이름 |
| `body` | text NOT NULL | 댓글 내용 |
| `created_at` | timestamptz default `now()` | 작성일 |

> 방문자 계정이 없으므로 **익명 댓글**(이름 + 내용). 스팸 방지는 향후 과제(캡차/신고).

### `likes` 테이블 (좋아요)
| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | uuid PK | 좋아요 ID |
| `post_id` | uuid FK → `posts.id` (`on delete cascade`) | 대상 게시물 |
| `visitor_id` | text NOT NULL | 브라우저 식별자(localStorage UUID) |
| `created_at` | timestamptz default `now()` | 생성일 |
| — | `unique(post_id, visitor_id)` | 브라우저당 1회 좋아요 보장 |

> 로그인 없이 **브라우저 단위 토글**. 좋아요 수는 `count(*)`, 내 상태는 `visitor_id`
> 일치 행 존재 여부로 판단.

### RLS (Row Level Security) 정책
- `posts`: **공개 읽기**, **쓰기(INSERT/UPDATE/DELETE)는 `authenticated`만**.
- Storage 버킷 `post-images`: **공개 읽기**, **업로드/수정/삭제는 authenticated만**.
- `comments`: **공개 읽기 + 공개 INSERT(익명 작성)**, **DELETE는 `authenticated`만**(관리자 모더레이션).
- `likes`: **공개 읽기 + 공개 INSERT/DELETE**(익명 토글).

### SNS 공유 (DB 불필요, 프론트엔드)
- **Web Share API**(`navigator.share`) 우선 — 모바일에서 OS 공유 시트로 **카카오톡·
  인스타그램 등 설치된 모든 SNS** 공유 가능.
- 데스크톱 폴백: **X(Twitter)**, **Facebook** 공유 인텐트 링크 + **링크 복사**.
- 카카오톡 전용 인앱 공유 버튼이 필요하면 Kakao JS SDK + 앱 키 등록으로 확장(선택).

### 관리자 계정
- Supabase Auth의 Email/Password로 관리자 1명 생성(대시보드에서 생성).
- 회원가입 UI 없음(로그인만 제공) → 사실상 관리자 전용.

---

## 프로젝트 구조 (실제 구현)
```
test2-sohyun/  (repo root)
├── public/
│   ├── _redirects            # SPA 라우팅: /* /index.html 200
│   └── favicon.svg
├── src/
│   ├── main.jsx              # 엔트리 (Router + AuthProvider)
│   ├── App.jsx               # 라우터 정의 + 레이아웃(Navbar/Footer)
│   ├── index.css             # Tailwind 지시자 + masonry 유틸
│   ├── lib/
│   │   ├── supabase.js       # Supabase 클라이언트 + 버킷 상수
│   │   └── visitor.js        # 익명 좋아요용 브라우저 visitor_id
│   ├── context/
│   │   └── AuthContext.jsx   # 로그인 세션 상태
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── GalleryGrid.jsx   # 갤러리 그리드
│   │   ├── PostCard.jsx      # 카드 1개
│   │   ├── Lightbox.jsx      # 이미지 확대 뷰어
│   │   ├── ImageUploader.jsx # Storage 업로드
│   │   ├── LikeButton.jsx    # 좋아요 토글 + 카운트
│   │   ├── ShareButtons.jsx  # SNS 공유 (Web Share + X/FB/링크복사)
│   │   ├── Comments.jsx      # 댓글 목록 + 작성 폼
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── Home.jsx          # 갤러리 홈
│   │   ├── PostDetail.jsx    # 상세(사진+글+좋아요+공유+댓글)
│   │   ├── Login.jsx         # 관리자 로그인
│   │   ├── AdminDashboard.jsx# 게시물 목록/삭제
│   │   └── PostEditor.jsx    # 작성/수정
│   └── hooks/
│       ├── usePosts.js       # 게시물 조회 훅(usePosts / usePost)
│       ├── useComments.js    # 댓글 조회/작성/삭제
│       └── useLikes.js       # 좋아요 카운트/토글
├── supabase/
│   └── schema.sql            # 테이블 + RLS + 버킷 정책 SQL
├── docs/
│   ├── DEVELOPMENT_PLAN.md   # (이 문서)
│   └── PROMPT.md             # 프로젝트 빌드 프롬프트/스펙
├── .env.example              # 필요한 env 키 문서화
├── .gitignore
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── README.md
```

### 라우트 구성
| 경로 | 페이지 | 접근 |
|------|--------|------|
| `/` | Home (갤러리 그리드) | 공개 |
| `/posts/:id` | PostDetail | 공개 |
| `/login` | Login | 공개 |
| `/admin` | AdminDashboard (목록/삭제) | 보호 |
| `/admin/new` | PostEditor (작성) | 보호 |
| `/admin/edit/:id` | PostEditor (수정) | 보호 |

### 환경변수
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```
`.env.local`(로컬)과 Cloudflare Pages 환경변수 양쪽에 등록. anon key만 사용(브라우저
노출 안전), 보안은 RLS로 담보. `service_role` key는 프론트엔드에 절대 넣지 않는다.

---

## 구현 단계 (Implementation Phases) — 완료 이력
- **Phase 1 — 스캐폴딩 & Git**: Vite React + 의존성 + Tailwind/PostCSS 설정, `.gitignore`,
  `.env.example`, README, `git init` + 초기 커밋. ✅
- **Phase 2 — Supabase 스키마**: `supabase/schema.sql`(posts + RLS + 버킷 정책),
  `src/lib/supabase.js`, `AuthContext`. ✅
- **Phase 3 — 공개(읽기) 화면**: `Navbar`, 라우터, `Home`+`GalleryGrid`+`PostCard`,
  `PostDetail`+`Lightbox`. ✅
- **Phase 4 — 관리자(등록) 기능**: `Login`(Supabase Auth), `ProtectedRoute`,
  `PostEditor`, `ImageUploader`(Storage 업로드), `AdminDashboard`. ✅
- **Phase 5 — 배포 설정**: `public/_redirects`, `npm run build` 검증. ✅
- **Phase 6 — 참여 기능(댓글/좋아요/공유)**: `comments`·`likes` 테이블 + RLS,
  `useComments`/`useLikes` 훅, `lib/visitor.js`, `Comments`/`LikeButton`/
  `ShareButtons` 컴포넌트, `PostDetail`에 통합. ✅

---

## 외부 설정 단계 (사용자 계정/권한 필요)
> ⚠️ 이 세션은 비대화형이라 Supabase/Cloudflare 커넥터 인증 및 `gh` CLI가 없어
> **자동 생성이 불가**하다. 코드/SQL/설정은 모두 준비돼 있으므로 아래만 수행하면 된다.

1. **GitHub 저장소**: 새 repo 생성 후 push.
   ```bash
   git remote add origin https://github.com/<you>/<repo>.git
   git push -u origin main
   ```
   (`gh` 설치·인증 시: `gh repo create hongdae-travel --public --source=. --push`)
2. **Supabase 프로젝트**: supabase.com에서 프로젝트 생성 → SQL Editor에서
   `supabase/schema.sql` 실행 → Storage 버킷 `post-images`(public) 확인 →
   Authentication에서 관리자 이메일 계정 생성 → Project URL / anon key를 `.env.local`
   및 Cloudflare에 입력.
3. **Cloudflare Pages**: Pages에서 GitHub repo 연결 → Build command `npm run build`,
   Output dir `dist` → 환경변수 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` 등록 →
   배포. 이후 push 시 자동 재배포.

---

## 검증 (Verification)
- **로컬 실행**: `npm run dev` → 홈(`/`) 렌더, 콘솔 에러 없음.
- **빌드**: `npm run build` 성공(90 modules, `dist/` 생성) — ✅ 확인 완료.
- **부팅**: preview 서버 `HTTP 200`, 루트 div 렌더, SPA 딥링크(`/posts/x`) `200` — ✅.
- **읽기 흐름**: 샘플 게시물 insert 후 홈 그리드/상세 페이지 표시 확인. (Supabase 연동 후)
- **인증 흐름**: `/login` 관리자 로그인 → `/admin/new`에서 이미지 업로드 + 게시물 작성 →
  홈 노출 확인. 비로그인 시 `/admin/*` 접근 차단 확인. (Supabase 연동 후)
- **RLS 확인**: 비로그인(anon)의 `posts` insert 거부 확인. (Supabase 연동 후)
- **참여 기능**: 상세 페이지에서 좋아요 토글(새로고침 후 유지) · 댓글 작성/표시 ·
  관리자 로그인 시 댓글 삭제 · SNS 공유(모바일 공유 시트 / 데스크톱 X·FB·링크복사) 확인.
- **배포**: Cloudflare Pages URL에서 홈/상세 및 SPA 라우팅(새로고침) 확인.

## 리스크 / 참고
- **비밀키**: `service_role` key는 절대 프론트엔드에 넣지 않는다. anon key + RLS만 사용.
- **SPA 라우팅**: `_redirects` 없으면 딥링크 새로고침 시 404 → 필수.
- **이미지 최적화**: MVP는 원본 업로드. 추후 리사이즈/썸네일 최적화 고려.
- **익명 댓글/좋아요 스팸**: `comments` INSERT와 `likes` INSERT/DELETE가 anon에 열려
  있어 악용 여지 있음. 향후 캡차/rate limit/신고·모더레이션, Edge Function 검증 등 고려.
- **좋아요 정확도**: `visitor_id`는 브라우저 localStorage 기반이라 브라우저/기기가
  바뀌면 재좋아요 가능(정밀 집계는 계정 도입 시). MVP 수용 범위.
- **범위**: 관리자 1인 기준. 다중 작성자, 답글/대댓글, 알림은 향후 확장 항목.
