-- Migration 002: extend user_profiles for onboarding, resume analysis, RLS write policies

-- Add new columns to user_profiles
alter table public.user_profiles
  add column if not exists full_name       text,
  add column if not exists bio             text,
  add column if not exists primary_stack   text[]      not null default '{}',
  add column if not exists career_goal     text,
  add column if not exists github_url      text,
  add column if not exists linkedin_url    text,
  add column if not exists resume_url      text,
  add column if not exists resume_analysis jsonb,
  add column if not exists onboarded       boolean     not null default false;

-- Fix RLS: add explicit INSERT and UPDATE policies so frontend can write profiles
drop policy if exists "own data" on public.user_profiles;

create policy "select own profile"  on public.user_profiles for select using (auth.uid()::text = user_id);
create policy "insert own profile"  on public.user_profiles for insert with check (auth.uid()::text = user_id);
create policy "update own profile"  on public.user_profiles for update using (auth.uid()::text = user_id);

-- Same for tasks
drop policy if exists "own data" on public.tasks;
create policy "select own tasks"  on public.tasks for select using (auth.uid()::text = user_id);
create policy "insert own tasks"  on public.tasks for insert with check (auth.uid()::text = user_id);
create policy "update own tasks"  on public.tasks for update using (auth.uid()::text = user_id);
create policy "delete own tasks"  on public.tasks for delete using (auth.uid()::text = user_id);

-- Same for streaks
drop policy if exists "own data" on public.streaks;
create policy "select own streaks"  on public.streaks for select using (auth.uid()::text = user_id);
create policy "insert own streaks"  on public.streaks for insert with check (auth.uid()::text = user_id);
create policy "update own streaks"  on public.streaks for update using (auth.uid()::text = user_id);

-- Same for agent_results
drop policy if exists "own data" on public.agent_results;
create policy "select own results"  on public.agent_results for select using (auth.uid()::text = user_id);
create policy "insert own results"  on public.agent_results for insert with check (auth.uid()::text = user_id);

-- Same for dsa_attempts
drop policy if exists "own data" on public.dsa_attempts;
create policy "select own dsa"  on public.dsa_attempts for select using (auth.uid()::text = user_id);
create policy "insert own dsa"  on public.dsa_attempts for insert with check (auth.uid()::text = user_id);
