-- Run this in your Supabase SQL Editor to create the waitlist table

create table if not exists waitlist (
  id bigint generated always as identity primary key,
  email text not null unique,
  source text default 'landing',
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table waitlist enable row level security;

-- Allow inserts from the service role (API route uses service key)
-- No public read access needed
create policy "Service role can insert" on waitlist
  for insert with check (true);

create policy "Service role can select" on waitlist
  for select using (true);
