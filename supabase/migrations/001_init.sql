-- DevOS — initial schema
-- Run in Supabase SQL editor or via supabase db push

-- ── Extensions ────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── User Profiles ─────────────────────────────────────────
create table if not exists public.user_profiles (
  user_id        text primary key,              -- Supabase auth.users.id
  skills         jsonb        not null default '[]',
  experience_years integer    not null default 0,
  target_roles   jsonb        not null default '[]',
  resume_text    text         not null default '',
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);

-- ── Streaks ───────────────────────────────────────────────
create table if not exists public.streaks (
  id             uuid         primary key default uuid_generate_v4(),
  user_id        text         not null references public.user_profiles(user_id) on delete cascade,
  current_count  integer      not null default 0,
  longest_count  integer      not null default 0,
  last_checked_in date        not null default current_date,
  updated_at     timestamptz  not null default now()
);

-- ── Daily Tasks ───────────────────────────────────────────
create table if not exists public.tasks (
  id             uuid         primary key default uuid_generate_v4(),
  user_id        text         not null references public.user_profiles(user_id) on delete cascade,
  label          text         not null,
  tag            text         not null,          -- DSA | Learn | Jobs | News
  done           boolean      not null default false,
  task_date      date         not null default current_date,
  created_at     timestamptz  not null default now()
);

-- ── Agent Results ─────────────────────────────────────────
create table if not exists public.agent_results (
  id             uuid         primary key default uuid_generate_v4(),
  user_id        text         not null references public.user_profiles(user_id) on delete cascade,
  agent          text         not null check (agent in ('resume', 'job', 'learn')),
  result         jsonb        not null default '{}',
  created_at     timestamptz  not null default now()
);

-- ── DSA Attempts ──────────────────────────────────────────
create table if not exists public.dsa_attempts (
  id             uuid         primary key default uuid_generate_v4(),
  user_id        text         not null references public.user_profiles(user_id) on delete cascade,
  problem_slug   text         not null,
  difficulty     text         not null check (difficulty in ('Easy', 'Medium', 'Hard')),
  solved         boolean      not null default false,
  attempted_at   timestamptz  not null default now()
);

-- ── Row-Level Security ────────────────────────────────────
alter table public.user_profiles  enable row level security;
alter table public.streaks        enable row level security;
alter table public.tasks          enable row level security;
alter table public.agent_results  enable row level security;
alter table public.dsa_attempts   enable row level security;

-- Users can only read/write their own data
create policy "own data" on public.user_profiles  using (auth.uid()::text = user_id);
create policy "own data" on public.streaks        using (auth.uid()::text = user_id);
create policy "own data" on public.tasks          using (auth.uid()::text = user_id);
create policy "own data" on public.agent_results  using (auth.uid()::text = user_id);
create policy "own data" on public.dsa_attempts   using (auth.uid()::text = user_id);

-- ── Indexes ───────────────────────────────────────────────
create index if not exists tasks_user_date        on public.tasks(user_id, task_date);
create index if not exists agent_results_user     on public.agent_results(user_id, agent);
create index if not exists dsa_attempts_user      on public.dsa_attempts(user_id);

-- ── Auto-update updated_at ────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger set_updated_at before update on public.user_profiles
  for each row execute function public.set_updated_at();

create trigger set_updated_at before update on public.streaks
  for each row execute function public.set_updated_at();
