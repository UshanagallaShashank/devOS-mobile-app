-- Seed data for local development
-- Run after 001_init.sql

insert into public.user_profiles (user_id, skills, experience_years, target_roles)
values (
  'dev-user-001',
  '["Python", "TypeScript", "React", "FastAPI"]',
  1,
  '["Junior AI Engineer", "Software Engineer I"]'
) on conflict (user_id) do nothing;

insert into public.streaks (user_id, current_count, longest_count)
values ('dev-user-001', 12, 21)
on conflict do nothing;

insert into public.tasks (user_id, label, tag, done)
values
  ('dev-user-001', 'Solve 1 LeetCode Medium', 'DSA', true),
  ('dev-user-001', 'Read: RAG architecture deep dive', 'Learn', false),
  ('dev-user-001', 'Apply to 2 jobs from matches', 'Jobs', false),
  ('dev-user-001', 'Review AI news brief', 'News', false)
on conflict do nothing;
