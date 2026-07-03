-- ============================================================================
-- rate_limit_hits + rate_limit_check() — cross-instance rate limiting
-- ----------------------------------------------------------------------------
-- Serverless functions don't share memory, so an in-process counter can't cap
-- a client that lands on different instances. This gives the Next.js routes a
-- shared, atomic sliding-window limiter backed by Postgres.
--
-- Privacy: the bucket is a SHA-256 hash of the IP (+ purpose), never the raw IP.
--
-- Run with:  supabase db push        (or paste into the SQL editor)
-- Safe to re-run: idempotent.
-- ============================================================================

create table if not exists public.rate_limit_hits (
  bucket text        not null,
  at     timestamptz not null default now()
);

create index if not exists rate_limit_hits_bucket_at_idx
  on public.rate_limit_hits (bucket, at desc);

alter table public.rate_limit_hits enable row level security;  -- service-role only

-- Atomic check-and-record. Returns TRUE if the request is allowed, FALSE if the
-- bucket has already reached p_max hits inside the trailing p_window_seconds.
create or replace function public.rate_limit_check(
  p_bucket         text,
  p_max            int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  cnt int;
begin
  -- Drop this bucket's expired rows so the remaining count == hits in-window.
  delete from public.rate_limit_hits
   where bucket = p_bucket
     and at < now() - make_interval(secs => p_window_seconds);

  select count(*) into cnt
    from public.rate_limit_hits
   where bucket = p_bucket;

  if cnt >= p_max then
    return false;                 -- denied
  end if;

  insert into public.rate_limit_hits (bucket) values (p_bucket);
  return true;                    -- allowed
end;
$$;
