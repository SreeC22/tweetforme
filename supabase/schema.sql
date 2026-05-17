-- tweetforme waitlist table
-- Run this once in Supabase → SQL Editor.

create table if not exists public.waitlist (
  id          uuid        primary key default gen_random_uuid(),
  email       text        not null unique,
  source      text        default 'landing',
  created_at  timestamptz default now()
);

create index if not exists waitlist_created_at_idx
  on public.waitlist (created_at);

-- Lock the table down: only the service role key (server-side) can read/write.
-- The anon key (which is safe to expose client-side) cannot touch this table
-- because we add zero policies.
alter table public.waitlist enable row level security;
