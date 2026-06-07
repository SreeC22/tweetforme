-- ============================================================================
-- tweetforme / echo — orchestration cron
-- ----------------------------------------------------------------------------
-- The scheduled half of the orchestration layer:
--   1. publish-due  — every minute, auto-publish APPROVED posts whose time has
--                     come (status='scheduled', hold=false, scheduled_for<=now).
--   2. generate-tweets — daily, top up the queue with fresh drafts per the
--                        account's posting schedule.
--
-- These call the Edge Functions over HTTP via pg_net.
--
-- ⚠️  BEFORE RUNNING: replace the two placeholders below, OR (recommended) store
--     them in Vault and use the get_secret() helper — see docs/GOING_LIVE.md.
--       __PROJECT_REF__       e.g. qiojxbwdzqktlpgilrbg
--       __SERVICE_ROLE_KEY__  Supabase → Settings → API → service_role key
-- ============================================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ── secrets helper ──────────────────────────────────────────────────────────
-- Reads a secret from Vault if present, else falls back to a hardcoded value.
-- Populate Vault once (does NOT live in this migration / git):
--   select vault.create_secret('https://__PROJECT_REF__.supabase.co', 'project_url');
--   select vault.create_secret('__SERVICE_ROLE_KEY__',                'service_role_key');
create or replace function public.get_secret(p_name text, p_fallback text)
returns text language plpgsql security definer
set search_path = public, vault as $$
declare v text;
begin
  begin
    select decrypted_secret into v
    from vault.decrypted_secrets
    where name = p_name
    limit 1;
  exception when others then
    v := null;       -- Vault not enabled / no access → use fallback
  end;
  return coalesce(v, p_fallback);
end;
$$;

-- Convenience wrapper that POSTs to an Edge Function with the service-role key.
create or replace function public.invoke_edge(p_function text, p_body jsonb default '{}'::jsonb)
returns bigint language plpgsql security definer as $$
declare
  base text := public.get_secret('project_url',     'https://__PROJECT_REF__.supabase.co');
  key  text := public.get_secret('service_role_key', '__SERVICE_ROLE_KEY__');
  req_id bigint;
begin
  select net.http_post(
    url     := base || '/functions/v1/' || p_function,
    headers := jsonb_build_object(
                 'Content-Type',  'application/json',
                 'Authorization', 'Bearer ' || key
               ),
    body    := p_body,
    timeout_milliseconds := 55000
  ) into req_id;
  return req_id;
end;
$$;

-- ── schedule the jobs (idempotent) ──────────────────────────────────────────
-- cron.schedule upserts by name on recent pg_cron; unschedule first to be safe.
do $$
begin
  perform cron.unschedule('publish-due-every-minute');
exception when others then null;
end $$;

do $$
begin
  perform cron.unschedule('generate-tweets-daily');
exception when others then null;
end $$;

-- Auto-publish approved + due posts, every minute.
select cron.schedule(
  'publish-due-every-minute',
  '* * * * *',
  $$ select public.invoke_edge('publish-due'); $$
);

-- Top up drafts once a day at 13:00 UTC. The function only generates as many as
-- the schedule needs, so running daily is safe and cheap.
select cron.schedule(
  'generate-tweets-daily',
  '0 13 * * *',
  $$ select public.invoke_edge('generate-tweets', '{"source":"cron"}'::jsonb); $$
);

-- Inspect / manage:
--   select * from cron.job;
--   select * from cron.job_run_details order by start_time desc limit 20;
