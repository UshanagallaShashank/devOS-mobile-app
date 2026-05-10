create table if not exists concept_explanations (
  concept_key  text primary key,          -- "{concept}:{category}"
  data         jsonb not null,
  created_at   timestamptz default now()
);
