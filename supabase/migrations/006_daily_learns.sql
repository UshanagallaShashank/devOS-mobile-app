create table if not exists public.daily_learns (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        references auth.users(id) on delete cascade not null,
  concept_id   text        not null,
  concept_title text       not null,
  category     text        not null,
  learned_at   date        not null default current_date,
  created_at   timestamptz default now(),
  unique(user_id, concept_id)
);

alter table public.daily_learns enable row level security;

create policy "Users can manage own daily_learns"
  on public.daily_learns for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
