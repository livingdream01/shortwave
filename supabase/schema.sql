-- Shortwave schema (Supabase / Postgres)
-- Apply with: supabase db push   (or psql < supabase/schema.sql)

create extension if not exists "pgcrypto";

-- Connected social accounts (Instagram now; TikTok/YouTube later)
create table if not exists accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null check (platform in ('instagram','tiktok','youtube')),
  external_id text not null,               -- IG user id
  username text,
  access_token_enc text,                   -- encrypted long-lived token
  token_expires_at timestamptz,
  is_test boolean not null default true,   -- publish to test account by default
  status text not null default 'active',
  created_at timestamptz not null default now(),
  unique (platform, external_id)
);

-- A serialized show: one format + art style + cast
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

-- Consistent AI cast within a series
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
  kind text not null,                       -- video|audio|caption|thumbnail
  storage_url text,
  local_path text,
  meta jsonb not null default '{}'
);

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  episode_id uuid not null references episodes(id) on delete cascade,
  account_id uuid references accounts(id),
  platform text not null,
  external_id text,                         -- IG media id
  permalink text,
  caption text,
  affiliate_links jsonb not null default '[]',
  status text not null default 'pending',   -- pending|published|failed
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

-- Thompson-sampling bandit state per arm key
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

-- Agent run trace (Mission Control)
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
