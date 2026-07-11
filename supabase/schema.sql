-- =====================================================================
-- Hongdae Travel — Supabase schema
-- Run this in the Supabase Dashboard → SQL Editor (one time per project).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. posts table
-- ---------------------------------------------------------------------
create table if not exists public.posts (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  content         text,
  location        text,
  district        text,                          -- e.g. 'Hongdae','Euljiro','Seongsu'
  category        text,                          -- e.g. 'eats','cafes','streets','music','shops','outdoors'
  cover_image_url text,
  images          text[] not null default '{}',
  map_url         text,                          -- Google Maps link
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Keep updated_at fresh on every update.
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- Newest-first browsing.
create index if not exists posts_created_at_idx on public.posts (created_at desc);

-- ---------------------------------------------------------------------
-- 2. Row Level Security: public read, authenticated write
-- ---------------------------------------------------------------------
alter table public.posts enable row level security;

drop policy if exists "posts are viewable by everyone" on public.posts;
create policy "posts are viewable by everyone"
  on public.posts for select
  using (true);

drop policy if exists "authenticated can insert posts" on public.posts;
create policy "authenticated can insert posts"
  on public.posts for insert
  to authenticated
  with check (true);

drop policy if exists "authenticated can update posts" on public.posts;
create policy "authenticated can update posts"
  on public.posts for update
  to authenticated
  using (true) with check (true);

drop policy if exists "authenticated can delete posts" on public.posts;
create policy "authenticated can delete posts"
  on public.posts for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 3. Storage bucket for gallery images
--    (You can also create the bucket via Dashboard → Storage → New bucket,
--     named "post-images", set to Public.)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- Public read of images.
drop policy if exists "post images are publicly readable" on storage.objects;
create policy "post images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'post-images');

-- Only authenticated users may upload / modify / delete images.
drop policy if exists "authenticated can upload post images" on storage.objects;
create policy "authenticated can upload post images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images');

drop policy if exists "authenticated can update post images" on storage.objects;
create policy "authenticated can update post images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'post-images');

drop policy if exists "authenticated can delete post images" on storage.objects;
create policy "authenticated can delete post images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images');

-- ---------------------------------------------------------------------
-- 4. comments table (anonymous visitors may comment; admin moderates)
-- ---------------------------------------------------------------------
create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts (id) on delete cascade,
  author_name text not null,
  body        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists comments_post_id_idx
  on public.comments (post_id, created_at);

alter table public.comments enable row level security;

drop policy if exists "comments are viewable by everyone" on public.comments;
create policy "comments are viewable by everyone"
  on public.comments for select
  using (true);

-- Anyone (anon or authenticated) may post a comment.
drop policy if exists "anyone can add a comment" on public.comments;
create policy "anyone can add a comment"
  on public.comments for insert
  with check (true);

-- Only the admin (authenticated) may delete/moderate comments.
drop policy if exists "authenticated can delete comments" on public.comments;
create policy "authenticated can delete comments"
  on public.comments for delete
  to authenticated
  using (true);

-- ---------------------------------------------------------------------
-- 5. likes table (anonymous, one like per browser via a client visitor id)
-- ---------------------------------------------------------------------
create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  post_id    uuid not null references public.posts (id) on delete cascade,
  visitor_id text not null,                     -- random UUID stored in localStorage
  created_at timestamptz not null default now(),
  unique (post_id, visitor_id)                  -- prevents double-likes per browser
);

create index if not exists likes_post_id_idx on public.likes (post_id);

alter table public.likes enable row level security;

drop policy if exists "likes are viewable by everyone" on public.likes;
create policy "likes are viewable by everyone"
  on public.likes for select
  using (true);

-- Anyone may like (insert) and unlike (delete) — toggle behavior.
drop policy if exists "anyone can like" on public.likes;
create policy "anyone can like"
  on public.likes for insert
  with check (true);

drop policy if exists "anyone can unlike" on public.likes;
create policy "anyone can unlike"
  on public.likes for delete
  using (true);

-- ---------------------------------------------------------------------
-- 6. ai_usage (Claude API token/cost log — admin only)
-- ---------------------------------------------------------------------
create table if not exists public.ai_usage (
  id            uuid primary key default gen_random_uuid(),
  model         text not null,
  input_tokens  integer not null default 0,
  output_tokens integer not null default 0,
  cost_usd      numeric(10,6) not null default 0,
  created_at    timestamptz not null default now()
);

create index if not exists ai_usage_created_at_idx on public.ai_usage (created_at desc);

alter table public.ai_usage enable row level security;

drop policy if exists "authenticated can read ai usage" on public.ai_usage;
create policy "authenticated can read ai usage"
  on public.ai_usage for select to authenticated using (true);

drop policy if exists "authenticated can insert ai usage" on public.ai_usage;
create policy "authenticated can insert ai usage"
  on public.ai_usage for insert to authenticated with check (true);

-- ---------------------------------------------------------------------
-- 7. products (Guidebook e-books sold via Gumroad — admin managed)
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id              uuid primary key default gen_random_uuid(),
  title           text not null,
  subtitle        text,
  description     text,
  price_label     text,                 -- display only; real price lives on Gumroad
  cover_image_url text,
  gumroad_url     text not null,
  published       boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products (created_at desc);

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "public reads published products" on public.products;
create policy "public reads published products"
  on public.products for select to anon using (published = true);

drop policy if exists "authenticated reads all products" on public.products;
create policy "authenticated reads all products"
  on public.products for select to authenticated using (true);

drop policy if exists "authenticated can insert products" on public.products;
create policy "authenticated can insert products"
  on public.products for insert to authenticated with check (true);

drop policy if exists "authenticated can update products" on public.products;
create policy "authenticated can update products"
  on public.products for update to authenticated using (true) with check (true);

drop policy if exists "authenticated can delete products" on public.products;
create policy "authenticated can delete products"
  on public.products for delete to authenticated using (true);

-- ---------------------------------------------------------------------
-- 8. subscribers (email list for the "Seoul checklist" lead magnet)
--    Public may subscribe; only the admin can read/export (privacy).
-- ---------------------------------------------------------------------
create table if not exists public.subscribers (
  id         uuid primary key default gen_random_uuid(),
  email      text not null,
  source     text,
  created_at timestamptz not null default now()
);

create unique index if not exists subscribers_email_lower_idx
  on public.subscribers (lower(email));

alter table public.subscribers enable row level security;

drop policy if exists "anyone can subscribe" on public.subscribers;
create policy "anyone can subscribe"
  on public.subscribers for insert with check (true);

drop policy if exists "authenticated reads subscribers" on public.subscribers;
create policy "authenticated reads subscribers"
  on public.subscribers for select to authenticated using (true);

drop policy if exists "authenticated deletes subscribers" on public.subscribers;
create policy "authenticated deletes subscribers"
  on public.subscribers for delete to authenticated using (true);

-- =====================================================================
-- Admin account: create it in Dashboard → Authentication → Users → "Add user"
-- (email + password). There is no public sign-up UI, so that user is the
-- only person who can post.
-- =====================================================================
