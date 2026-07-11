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
  cover_image_url text,
  images          text[] not null default '{}',
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

-- =====================================================================
-- Admin account: create it in Dashboard → Authentication → Users → "Add user"
-- (email + password). There is no public sign-up UI, so that user is the
-- only person who can post.
-- =====================================================================
