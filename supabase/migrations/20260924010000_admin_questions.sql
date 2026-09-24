alter table public.questions add column if not exists published boolean not null default true;
alter table public.questions add column if not exists updated_at timestamptz not null default now();

update public.questions set published = true where id = 'divide-2026-09-24';

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create or replace function public.set_question_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists questions_updated_at on public.questions;
create trigger questions_updated_at before update on public.questions for each row execute function public.set_question_updated_at();
