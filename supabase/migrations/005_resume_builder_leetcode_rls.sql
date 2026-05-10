-- Migration 005: resume builder data + fix leetcode_progress RLS policies

-- Store manually-built resume sections on the profile
alter table public.user_profiles
  add column if not exists resume_data jsonb;

-- leetcode_progress was created without split policies — fix it
drop policy if exists "own data" on public.leetcode_progress;

create policy "select own lc progress" on public.leetcode_progress
  for select using (auth.uid()::text = user_id);
create policy "insert own lc progress" on public.leetcode_progress
  for insert with check (auth.uid()::text = user_id);
create policy "update own lc progress" on public.leetcode_progress
  for update using (auth.uid()::text = user_id);
create policy "delete own lc progress" on public.leetcode_progress
  for delete using (auth.uid()::text = user_id);
