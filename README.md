# Hongdae Travel 🎒

A **gallery-style travel blog** about Hongdae, Seoul. Visitors browse posts in a
masonry gallery, **like** and **comment** on posts, and **share** them to social
media; the **admin** signs in to publish posts and upload photos.

- **Frontend:** React 18 + Vite + Tailwind CSS + React Router
- **Backend:** Supabase (Postgres + Auth + Storage)
- **Engagement:** anonymous likes (per-browser), open comments, SNS share
  (Web Share API + X / Facebook / copy link)
- **AI drafts:** Claude writes post drafts from the admin editor (any Claude model,
  token/cost tracking) via a Cloudflare Pages Function that keeps the API key server-side
- **Deploy:** Cloudflare Pages (auto-deploy from GitHub)

---

## 1. Local setup

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase values
npm run dev                  # http://localhost:5173
```

`.env.local`:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

> Only the **anon** (publishable) key goes in the frontend. Never commit real
> keys — `.env.local` is git-ignored. Access control is enforced by Supabase RLS.

## 2. Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor** → paste & run [`supabase/schema.sql`](supabase/schema.sql).
   This creates the `posts`, `comments`, and `likes` tables, all RLS policies, and
   the `post-images` storage bucket.
3. **Storage** → confirm a **public** bucket named `post-images` exists (the SQL
   creates it; you can also make it via the UI).
4. **Authentication → Users → Add user** → create your admin email + password.
   There is no public sign-up UI, so this user is the only person who can post.
5. **Project Settings → API** → copy the **Project URL** and **anon key** into
   `.env.local` (and into Cloudflare later).

## 3. Deploy to Cloudflare Pages

1. Push this repo to GitHub (see below).
2. Cloudflare Dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
3. Select the repo. Build settings:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Environment variables:** add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
5. Deploy. `public/_redirects` handles SPA routing so deep links work on refresh.

Every push to the connected branch triggers an automatic redeploy.

## 3b. AI draft writing (Claude) — optional

The admin editor can generate a post draft with Claude. The Anthropic API key is
**never** in the frontend — it lives server-side in a Cloudflare Pages Function
(`functions/api/ai/*`), which only responds to a signed-in admin.

1. Run [`supabase/schema.sql`](supabase/schema.sql) if you haven't (adds the `ai_usage` table).
2. Create an API key at <https://console.anthropic.com/settings/keys> (starts with `sk-ant-`).
3. **Cloudflare Pages → Settings → Environment variables** → add `ANTHROPIC_API_KEY`
   (do **not** prefix with `VITE_`). Redeploy.
4. In the app: **Admin → ✨ AI** → *Test API key* to confirm it's applied to the site.
5. In the post editor, pick a model, optionally add notes, and click **Generate draft**.
   Per-generation tokens + cost show inline; cumulative cost is charted in **Admin → AI**.

> The AI endpoints run on the deployed Cloudflare site (or locally via
> `npx wrangler pages dev dist` with a `.dev.vars` file) — **not** under `npm run dev`,
> which serves only the static frontend without Functions.
>
> Default model is **Opus 4.8**; all current Claude models are selectable
> (Fable 5, Opus 4.8/4.7/4.6, Sonnet 5/4.6, Haiku 4.5).

## 4. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: Hongdae Travel gallery blog"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```

> `gh` CLI shortcut (if installed & authenticated):
> `gh repo create hongdae-travel --public --source=. --remote=origin --push`

---

## Project structure

```
src/
├── lib/supabase.js        Supabase client + bucket name
├── lib/visitor.js         Per-browser id for anonymous likes
├── context/AuthContext    Session state (login / logout)
├── hooks/                 usePosts, useComments, useLikes
├── components/            Navbar, GalleryGrid, PostCard, Lightbox,
│                          ImageUploader, ProtectedRoute,
│                          LikeButton, ShareButtons, Comments
└── pages/                 Home, PostDetail, Login, AdminDashboard, PostEditor
supabase/schema.sql        DB tables (posts/comments/likes) + RLS + storage policies
public/_redirects          Cloudflare Pages SPA fallback
```

## Routes

| Path              | Page            | Access    |
| ----------------- | --------------- | --------- |
| `/`               | Gallery home    | Public    |
| `/posts/:id`      | Post detail     | Public    |
| `/login`          | Admin sign in   | Public    |
| `/admin`          | Dashboard       | Protected |
| `/admin/new`      | Create post     | Protected |
| `/admin/edit/:id` | Edit post       | Protected |
