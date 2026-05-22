-- ============================================================================
-- Migration: create_contents
-- Spec: manajemen-konten
-- Requirements: 11.4, 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7
--
-- Sections:
--   1. Table public.contents (DDL + check constraints + index) (R13.1-R13.5)
--   2. Function public.set_updated_at() + trigger (R13.6)
--   3. Row Level Security + 4 policies on public.contents (R11.4)
--   4. Storage bucket content-media + 4 storage policies (R6.2, R13.7)
-- ============================================================================


-- ----------------------------------------------------------------------------
-- 1. Table public.contents (R13.1-R13.5)
-- ----------------------------------------------------------------------------

create table if not exists public.contents (
  id              bigint primary key generated always as identity,
  user_id         uuid not null references auth.users(id) on delete cascade,
  product_id      bigint references public.products(id) on delete set null,
  caption         text,
  platform        text not null,
  media_urls      text[] not null default '{}'::text[],
  scheduled_at    timestamptz,
  scheduling_mode text not null default 'custom_time',
  status          text not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  -- R13.2: platform check constraint
  constraint contents_platform_check
    check (platform in ('instagram', 'facebook', 'tiktok', 'twitter')),

  -- R13.3: status check constraint
  constraint contents_status_check
    check (status in ('draft', 'waiting_approval', 'approved', 'scheduled', 'published')),

  -- R13.4: scheduling_mode check constraint
  constraint contents_scheduling_mode_check
    check (scheduling_mode in ('custom_time', 'asap')),

  -- Defense-in-depth for R6.5 (max 10 media per content)
  constraint contents_media_urls_max
    check (cardinality(media_urls) <= 10)
);

-- R13.5: index on (user_id, scheduled_at) for efficient weekly range queries
create index if not exists contents_user_scheduled_at_idx
  on public.contents (user_id, scheduled_at);


-- ----------------------------------------------------------------------------
-- 2. Function public.set_updated_at() + trigger (R13.6)
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists contents_set_updated_at on public.contents;

create trigger contents_set_updated_at
before update on public.contents
for each row
execute function public.set_updated_at();


-- ----------------------------------------------------------------------------
-- 3. Row Level Security + 4 policies on public.contents (R11.4)
-- ----------------------------------------------------------------------------

alter table public.contents enable row level security;

drop policy if exists "contents_select_own" on public.contents;
create policy "contents_select_own"
  on public.contents
  for select
  using (user_id = auth.uid());

drop policy if exists "contents_insert_own" on public.contents;
create policy "contents_insert_own"
  on public.contents
  for insert
  with check (user_id = auth.uid());

drop policy if exists "contents_update_own" on public.contents;
create policy "contents_update_own"
  on public.contents
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "contents_delete_own" on public.contents;
create policy "contents_delete_own"
  on public.contents
  for delete
  using (user_id = auth.uid());


-- ----------------------------------------------------------------------------
-- 4. Storage bucket content-media + 4 storage policies (R6.2, R13.7)
--    Path layout: {auth.uid()}/{content_id_or_temp}/{uuid}.{ext}
--    storage.foldername(name)[1] equals auth.uid()::text for owner files.
-- ----------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('content-media', 'content-media', true)
on conflict (id) do update
  set public = excluded.public;

drop policy if exists "content_media_select_own" on storage.objects;
create policy "content_media_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'content-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "content_media_insert_own" on storage.objects;
create policy "content_media_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'content-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "content_media_update_own" on storage.objects;
create policy "content_media_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'content-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'content-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "content_media_delete_own" on storage.objects;
create policy "content_media_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'content-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
