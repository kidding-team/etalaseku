-- Phase 2A: persistent Meta connection storage
-- Split into 2 tables: metadata (user can SELECT own) + secrets (deny-all to client)

create table if not exists public.meta_connections (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  provider                  text not null default 'meta_business',
  page_id                   text not null,
  page_name                 text not null,
  ig_business_account_id    text,
  ig_username               text,
  scopes                    text[] not null default '{}'::text[],
  status                    text not null,
  connected_at              timestamptz not null default now(),
  last_verified_at          timestamptz,
  constraint meta_connections_status_check
    check (status in ('pending','active','disconnected','expired')),
  constraint meta_connections_user_page_unique
    unique (user_id, page_id)
);

create index if not exists meta_connections_user_status_idx
  on public.meta_connections (user_id, status);

alter table public.meta_connections enable row level security;

drop policy if exists "meta_connections_select_own" on public.meta_connections;
create policy "meta_connections_select_own"
  on public.meta_connections
  for select
  using (user_id = auth.uid());

create table if not exists public.meta_connection_secrets (
  connection_id      uuid primary key
    references public.meta_connections(id) on delete cascade,
  token_ciphertext   text not null,
  token_iv           text not null,
  token_tag          text not null,
  token_expires_at   timestamptz,
  created_at         timestamptz not null default now()
);

alter table public.meta_connection_secrets enable row level security;
-- No policies → deny-all from client. Server only via service role.
