-- arisstudying — Supabase schema
-- Paste the whole file into Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.

-- ── Tables ──────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  claude_project_url text,
  tracker_seeded boolean not null default false, -- 70% tracker pre-filled from the timetable once
  created_at timestamptz not null default now()
);
alter table public.profiles add column if not exists tracker_seeded boolean not null default false;

create table if not exists public.topic_progress (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  topic_id text not null,
  covered boolean not null default false,
  revised boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists public.checklist_progress (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  checklist_id text not null,
  done_steps int[] not null default '{}',
  updated_at timestamptz not null default now(),
  primary key (user_id, checklist_id)
);

create table if not exists public.notes (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  topic_id text not null,
  body text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, topic_id)
);

create table if not exists public.review_items (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  item_id text not null,
  item_type text not null,
  box int not null default 1,
  due_date date,
  last_result text,
  primary key (user_id, item_id)
);

create table if not exists public.quiz_attempts (
  id bigserial primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  item_id text not null,
  correct boolean not null,
  chosen text,
  created_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id bigserial primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  name text not null,
  module text,
  weight numeric,
  mark numeric,
  pass_fail boolean not null default false,
  date date
);

create table if not exists public.module_overrides (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  module_code text not null,
  name text not null,
  primary key (user_id, module_code)
);

create table if not exists public.flags (
  id bigserial primary key,
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  topic_id text,
  item_id text,
  message text,
  created_at timestamptz not null default now()
);

create table if not exists public.placement_progress (
  user_id uuid not null default auth.uid() references auth.users on delete cascade,
  placement_id text not null,
  status text not null default 'not-contacted'
    check (status in ('not-contacted', 'emailed', 'interview', 'confirmed')),
  interview_date date,
  interview_time text,
  updated_at timestamptz not null default now(),
  primary key (user_id, placement_id)
);

create index if not exists quiz_attempts_user_idx on public.quiz_attempts (user_id, item_id);
create index if not exists assessments_user_idx on public.assessments (user_id);
create index if not exists flags_user_idx on public.flags (user_id);

-- ── Row Level Security: everyone sees only their own rows ───────────────

alter table public.profiles enable row level security;
drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array[
    'topic_progress', 'checklist_progress', 'notes', 'review_items',
    'quiz_attempts', 'assessments', 'module_overrides', 'flags', 'placement_progress'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t
    );
  end loop;
end $$;

-- ── Create a profile automatically for each new user ────────────────────
-- The username is the part of the synthetic email before the @.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
