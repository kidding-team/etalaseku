-- Phase 2B: status per-platform per publish attempt
-- Status lifecycle: pending → publishing → published | failed

-- Function set_updated_at idempotent — kalau migration contents belum jalan,
-- fungsi dibuat di sini. Kalau sudah ada, replace dengan versi yang sama.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.content_publish_attempts (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users(id) on delete cascade,
  content_id            text,
  connection_id         uuid references public.meta_connections(id) on delete set null,
  platform              text not null,
  status                text not null,
  external_post_id      text,
  error_message         text,
  caption_snapshot      text,
  media_urls_snapshot   text[] not null default '{}'::text[],
  attempted_at          timestamptz,
  published_at          timestamptz,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),

  constraint cpa_platform_check
    check (platform in ('facebook_page', 'instagram')),
  constraint cpa_status_check
    check (status in ('pending', 'publishing', 'published', 'failed'))
);

create index if not exists cpa_user_created_idx
  on public.content_publish_attempts (user_id, created_at desc);

create index if not exists cpa_status_created_idx
  on public.content_publish_attempts (status, created_at);

-- Reuse trigger function dari migration contents
drop trigger if exists cpa_set_updated_at on public.content_publish_attempts;
create trigger cpa_set_updated_at
  before update on public.content_publish_attempts
  for each row
  execute function public.set_updated_at();

alter table public.content_publish_attempts enable row level security;

drop policy if exists "cpa_select_own" on public.content_publish_attempts;
create policy "cpa_select_own"
  on public.content_publish_attempts
  for select
  using (user_id = auth.uid());
-- Tidak ada insert/update/delete policy: hanya service role.
