-- ============================================================================
-- preview_tries — what visitors type into the landing-page "try it" widget
-- ----------------------------------------------------------------------------
-- Signal + a future fine-tuning dataset: every idea people try, the voice they
-- typed it in, and whether it was served by real AI (live) or the fallback.
-- No PII (no email, no IP). Service-role only — the anon key cannot read it.
--
-- Run with:  supabase db push        (or paste into the SQL editor)
-- Safe to re-run: idempotent.
-- ============================================================================

create table if not exists public.preview_tries (
  id          uuid primary key default gen_random_uuid(),
  idea        text not null,
  register    text,                                  -- 'genz' | 'formal' | 'default'
  live        boolean not null default false,        -- true = real AI, false = fallback
  created_at  timestamptz not null default now()
);

create index if not exists preview_tries_created_at_idx
  on public.preview_tries (created_at desc);

-- Lock it down: enable RLS with no anon policies, so only the service role
-- (Edge Functions / Next.js server routes) can read or write.
alter table public.preview_tries enable row level security;
