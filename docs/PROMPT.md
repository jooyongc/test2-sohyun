# Hongdae Travel — 프로젝트 빌드 프롬프트 (PROMPT.md)

이 문서는 **Hongdae Travel** 갤러리형 블로그를 처음부터 재현하기 위한 프롬프트/스펙이다.
AI 코딩 에이전트나 개발자에게 그대로 전달하면 동일한 앱을 만들 수 있도록 작성했다.

---

## 1. 원본 요청 (사용자, 그대로)

> 갤러리형 게시물을 등록하는 웹페이지를 만들거야. 블로그 형태로 구현하고, 갤러리
> 방식으로 보여지도록 하는 프론트 페이지를 만들거야. 블로그의 주제는 **Hongdae Travel**
> 이야. 개발 기본 스택 **react+vite** 로 구현, **cloudflare pages** 로 배포 예정.
> DB는 **SUPABASE** 로 연동할 것(현재 개설 전 상태). 모든 개발 파일은 **github** 로
> 커밋. github 레포지토리도 개설 전. 기본적인 개발 계획서를 작성해줘.

### 확정된 결정사항 (후속 확인)
| 항목 | 결정 |
|------|------|
| 게시 권한 | **관리자만** — Supabase Auth 로그인 필요 |
| 이미지 등록 | **Supabase Storage 업로드** |
| UI 언어 | **영어** |

---

## 2. 빌드 프롬프트 (재현용 스펙)

> 아래를 AI 에이전트에게 전달하면 동일한 결과를 재현할 수 있다.

**목표:** "Hongdae Travel"이라는 여행 블로그를 갤러리형으로 만든다. 방문자는 홈에서
게시물을 masonry 갤러리로 보고, 게시물을 열면 여러 사진 + 글 + 라이트박스를 본다.
관리자만 로그인해서 게시물을 등록/수정/삭제하고 사진을 업로드한다. UI 텍스트는 영어.

**기술 스택 (고정):**
- React 18 + Vite (JavaScript/JSX)
- Tailwind CSS (v3), PostCSS, autoprefixer
- react-router-dom v6 (SPA)
- @supabase/supabase-js (Postgres + Auth + Storage)
- 배포: Cloudflare Pages / 버전관리: GitHub

**요구 기능:**
1. **홈 (`/`)** — 모든 게시물을 최신순 masonry 그리드(CSS `columns`)로. 카드에는 커버
   이미지, 제목, 위치, 설명 미리보기. 이미지가 여러 장이면 `+N` 배지.
2. **게시물 상세 (`/posts/:id`)** — 제목/위치/작성일/본문 + 이미지 갤러리. 이미지 클릭 시
   라이트박스(←/→/ESC 키, 인덱스 표시). 로그인 상태면 "Edit" 버튼 노출.
3. **관리자 로그인 (`/login`)** — Supabase Auth email/password. 회원가입 UI 없음.
4. **대시보드 (`/admin`, 보호)** — 게시물 목록, View/Edit/Delete(확인 후 삭제).
5. **작성/수정 (`/admin/new`, `/admin/edit/:id`, 보호)** — 제목(필수)/위치/설명 +
   이미지 업로더. 업로드는 Supabase Storage(`post-images` 버킷) → public URL을
   `images text[]`에 저장, 첫 이미지를 `cover_image_url`로.
6. **접근 제어** — `ProtectedRoute`로 `/admin/*` 보호(미로그인 시 `/login` 리다이렉트).

**데이터 모델 (`posts` 테이블):**
`id uuid PK`, `title text NOT NULL`, `content text`, `location text`,
`cover_image_url text`, `images text[]`, `created_at timestamptz`,
`updated_at timestamptz`(트리거로 자동 갱신).

**보안 (RLS):**
- `posts`: 공개 `SELECT`, `INSERT/UPDATE/DELETE`는 `authenticated`만.
- Storage `post-images`: 공개 읽기, 업로드/수정/삭제는 `authenticated`만.
- 프론트에는 **anon key만** 사용. `service_role` key 절대 금지.

**배포:**
- `public/_redirects`에 `/* /index.html 200` (SPA 딥링크 새로고침 대응).
- Cloudflare Pages: build `npm run build`, output `dist`, 환경변수
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.

**완료 기준(Definition of Done):**
- `npm install && npm run build` 성공, `dist/` 생성.
- 홈/상세/로그인/대시보드/에디터 라우트 동작, `/admin/*` 미로그인 차단.
- Supabase 연동 후: 게시물 CRUD + 이미지 업로드 정상, RLS로 비로그인 쓰기 차단.
- 모든 소스 GitHub 커밋(비밀키·`node_modules` 제외).

---

## 3. 이 프로젝트에서 사용한 도구 프롬프트 (참고 이력)

실제 구현 시 사용자에게 물어 확정한 항목(권한/이미지/언어)과, 계획 승인 → 5단계 구현
→ 로컬 빌드/부팅 검증 → git 초기 커밋 순서로 진행했다. 상세 계획은
[`DEVELOPMENT_PLAN.md`](./DEVELOPMENT_PLAN.md), 설치/배포는 [`../README.md`](../README.md)
참조.

---

## 4. 향후 확장 아이디어 (프롬프트 씨앗)
- 이미지별 캡션/정렬 → `post_images` 정규화 테이블로 확장.
- 태그/카테고리 필터, 검색.
- 지도(위치 좌표) 연동, 방문 날짜 필드.
- 업로드 이미지 리사이즈/썸네일 최적화(Cloudflare Images 등).
- 댓글/좋아요(추가 테이블 + RLS).
