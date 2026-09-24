create extension if not exists pgcrypto;

create table if not exists public.questions (
  id text primary key,
  date date not null unique,
  prompt text not null,
  option_a_title text not null,
  option_a_detail text not null,
  option_b_title text not null,
  option_b_detail text not null,
  created_at timestamptz not null default now()
);

insert into public.questions (id, date, prompt, option_a_title, option_a_detail, option_b_title, option_b_detail)
values (
  'divide-2026-09-24',
  '2026-09-24',
  'Would you rather relive one day from your past whenever you want, or preview one day from your future?',
  'RELIVE ONE DAY',
  'Experience one day from your past exactly as it happened.',
  'PREVIEW ONE DAY',
  'See one day from your future before it happens.'
)
on conflict (id) do nothing;

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  question_id text not null references public.questions(id) on delete restrict,
  choice text not null check (choice in ('A', 'B')),
  confidence smallint not null check (confidence between 1 and 10),
  decision_time_ms integer not null check (decision_time_ms >= 0 and decision_time_ms <= 86400000),
  voter_id uuid not null,
  created_at timestamptz not null default now(),
  unique (question_id, voter_id)
);

create index if not exists votes_question_id_idx on public.votes(question_id);
create index if not exists votes_question_choice_idx on public.votes(question_id, choice);
create index if not exists votes_question_voter_idx on public.votes(question_id, voter_id);

alter table public.questions enable row level security;
alter table public.votes enable row level security;
