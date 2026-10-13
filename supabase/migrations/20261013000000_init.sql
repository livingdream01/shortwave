-- Shortwave schema: base tables + auth-linked connections vault.
-- Applied by `supabase db reset` (local) or `supabase db push` (cloud).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Operator profile (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Content domain
-- ---------------------------------------------------------------------------
create table if not exists series (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  format text not null,
  art_style text not null,
  narration_lang text not null default 'en',
  caption_langs text[] not null default '{en,zh}',
  voice_style text not null default 'narrator',
  cadence_per_day int not null default 3,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists characters (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references series(id) on delete cascade,
  name text not null,
  role text,
  personality text,
  appearance_prompt text not null,
  ref_image_prompt text,
  voice_id text
);

create table if not exists episodes (
  id uuid primary key default gen_random_uuid(),
  series_id uuid not null references series(id) on delete cascade,
  idx int not null,
  title text,
  hook text,
  script text,
  caption text,
  hashtags text[] not null default '{}',
  score numeric,
  arm jsonb not null default '{}',
  status text not null default 'planned',
  render_path text,
  created_at timestamptz not null default now(),
  unique (series_id, idx)
);

create table if not exists shots (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  idx int not null,
  prompt text not null,
  provider text,
  model text,
  duration_sec numeric not null default 3,
  clip_url text,
  failed boolean not null default false
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  kind text not null,
  storage_url text,
  local_path text,
  meta jsonb not null default '{}'
);

-- ---------------------------------------------------------------------------
-- Connections vault — encrypted OAuth tokens, owner-scoped
-- ---------------------------------------------------------------------------
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  platform text not null check (platform in ('instagram','tiktok','youtube')),
  external_id text not null,
  username text,
  token_ct text,            -- AES-256-GCM ciphertext (base64)
  token_iv text,            -- GCM iv (base64)
  token_tag text,           -- GCM auth tag (base64)
  token_expires_at timestamptz,
  is_test boolean not null default true,
  status text not null default 'active',
  connected_at timestamptz not null default now(),
  last_refreshed_at timestamptz,
  unique (owner_id, platform, external_id)
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  account_id uuid references accounts(id) on delete set null,
  platform text not null,
  external_id text,
  permalink text,
  caption text,
  affiliate_links jsonb not null default '[]',
  status text not null default 'pending',
  published_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists metrics (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references posts(id) on delete cascade,
  pulled_at timestamptz not null default now(),
  reach int default 0,
  plays int default 0,
  retention_3s numeric default 0,
  avg_watch_pct numeric default 0,
  completion numeric default 0,
  likes int default 0,
  comments int default 0,
  saves int default 0,
  shares int default 0,
  follows int default 0,
  clicks int default 0
);

create table if not exists experiments (
  arm_key text primary key,
  params jsonb not null,
  alpha numeric not null default 1,
  beta numeric not null default 1,
  impressions int not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists affiliate_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  commission text,
  rules jsonb not null default '{}'
);

create table if not exists affiliate_links (
  id uuid primary key default gen_random_uuid(),
  program_id uuid references affiliate_programs(id) on delete set null,
  label text,
  target_url text not null,
  utm jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create table if not exists runs (
  id uuid primary key default gen_random_uuid(),
  series_id uuid references series(id) on delete set null,
  trigger text not null,
  status text not null default 'running',
  token_usage int not null default 0,
  cost_usd numeric not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create table if not exists agent_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references runs(id) on delete cascade,
  name text not null,
  model text,
  status text not null,
  input_preview text,
  output_preview text,
  tokens int not null default 0,
  cost_usd numeric not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_episodes_series on episodes(series_id, idx);
create index if not exists idx_posts_episode on posts(episode_id);
create index if not exists idx_metrics_post on metrics(post_id, pulled_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles enable row level security;
drop policy if exists "profiles_own" on profiles;
create policy "profiles_own" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

alter table accounts enable row level security;
drop policy if exists "accounts_own" on accounts;
create policy "accounts_own" on accounts
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Client roles may read ONLY the non-secret columns of their own accounts.
grant usage on schema public to anon, authenticated;
grant select (id, platform, external_id, username, token_expires_at,
              is_test, status, connected_at, last_refreshed_at)
  on accounts to authenticated;

-- Token-free view for the UI (row-scoped by RLS via security_invoker).
create or replace view connections with (security_invoker = true) as
  select id, platform, external_id, username, token_expires_at,
         is_test, status, connected_at, last_refreshed_at
  from accounts;
grant select on connections to authenticated;

-- ---------------------------------------------------------------------------
-- New user -> profile row
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
