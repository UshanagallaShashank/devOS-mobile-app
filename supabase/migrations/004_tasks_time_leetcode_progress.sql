-- Migration 004: task time slots + LeetCode per-category progress

-- Add time slot columns to tasks
alter table public.tasks
  add column if not exists start_time text,
  add column if not exists end_time   text;

-- LeetCode per-category progress (user-editable solved count per topic)
create table if not exists public.leetcode_progress (
  user_id  text    not null references public.user_profiles(user_id) on delete cascade,
  category text    not null,
  solved   integer not null default 0,
  total    integer not null,
  primary key (user_id, category)
);

alter table public.leetcode_progress enable row level security;
create policy "own data" on public.leetcode_progress using (auth.uid()::text = user_id);
