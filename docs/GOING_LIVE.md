# Going live — tweetforme backend runbook

Everything the backend needs to run in production. Architecture: **All-in-Supabase**
(Postgres + Edge Functions + pg_cron). The dashboard (`content-pipeline.html`) talks
to Supabase directly with the anon key and calls Edge Functions for anything that
needs a secret (Claude, X).

```
content-pipeline.html ──anon key──▶ Supabase Postgres (posts/voice_profiles)
        │                                  ▲
        └──invokeFn()──▶ Edge Functions ───┘ (service role)
                            │  analyze-voice, generate-tweets, regenerate-tweet,
                            │  save-settings, publish-now, publish-due
                            ▼
                        Claude API  +  X API
        pg_cron ──every min──▶ publish-due      (auto-post approved + due)
        pg_cron ──daily──────▶ generate-tweets  (top up the queue)
```

---

## 0. Prereqs
- Supabase project: `qiojxbwdzqktlpgilrbg` (already created).
- The Supabase CLI: `npm i -g supabase` (or `brew install supabase/tap/supabase`).
- An Anthropic API key. An X (Twitter) API token (see §5).

## 1. Link the project
```bash
supabase login
supabase link --project-ref qiojxbwdzqktlpgilrbg
```

## 2. Apply the database schema
```bash
supabase db push
```
This runs `supabase/migrations/*` → creates `accounts`, `voice_profiles`, `posts`
(+ RLS, triggers, indexes). Re-runnable; it's all idempotent.

> Prefer the dashboard? Paste `supabase/migrations/20260607000001_core_schema.sql`
> into **SQL Editor** and run it.

## 3. Set the secrets (server-side only)
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
# Optional shared team X token (fallback when an account has none):
supabase secrets set X_BEARER_TOKEN=...
# Optional model override (defaults to claude-sonnet-4-6):
supabase secrets set CLAUDE_MODEL=claude-sonnet-4-6
```
`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically — don't set them.

## 4. Deploy the Edge Functions
```bash
supabase functions deploy analyze-voice
supabase functions deploy generate-tweets
supabase functions deploy regenerate-tweet
supabase functions deploy save-settings
supabase functions deploy publish-now
supabase functions deploy publish-due
```

Smoke test:
```bash
curl -s -X POST https://qiojxbwdzqktlpgilrbg.supabase.co/functions/v1/generate-tweets \
  -H "Authorization: Bearer <ANON_KEY>" -H "Content-Type: application/json" \
  -d '{"handle":"levelsio","brand_material":"shipped a thing today. it works. wild.\n\nmost of my best products were built in a weekend.","count":3}'
```

## 5. Turn on the scheduler (pg_cron)
1. In **Database → Extensions**, enable `pg_cron` and `pg_net`.
2. Open `supabase/migrations/20260607000002_cron.sql`. Either:
   - **Recommended:** store secrets in Vault, then run the file as-is:
     ```sql
     select vault.create_secret('https://qiojxbwdzqktlpgilrbg.supabase.co', 'project_url');
     select vault.create_secret('<SERVICE_ROLE_KEY>', 'service_role_key');
     ```
   - **Quick:** replace `__PROJECT_REF__` and `__SERVICE_ROLE_KEY__` inline.
3. Run the file in **SQL Editor**.
4. Verify: `select * from cron.job;` and later `select * from cron.job_run_details order by start_time desc limit 10;`

`publish-due` then runs every minute; `generate-tweets` runs daily at 13:00 UTC.

## 6. Point the dashboard at it
`content-pipeline.html` already has the project URL + anon key. Host it anywhere
static (Vercel, Netlify, GitHub Pages) or open it locally. First run:
**Add Brand Materials** → paste 5–20 past posts, set the posting frequency, paste
an X token → it learns the voice, generates drafts, and fills the feed.

---

## How the orchestration works

**Status lifecycle**
```
pending ──approve──▶ scheduled ──(auto @ scheduled_for | Post now)──▶ posted
   │                     │
   └──reject──▶ rejected └──Pause──▶ scheduled+hold (won't auto-post)
   └──regenerate──▶ pending (fresh text, re-review)
```

**The approval gate.** A post is sent **only** when `status='scheduled'` and
`hold=false`. `publish-due` (cron) and `publish-now` (manual) both go through
`_shared/publish.ts`, which is the single place anything becomes a live tweet.
Nothing un-approved can ever post.

**Auto-publish + manual override.** Approved posts auto-publish at `scheduled_for`.
In the post's modal you can also **Post now** (send immediately) or **Pause/Resume**
(hold without un-approving).

**Failures.** A failed publish stays `scheduled` and retries up to 3 times, then
flips to `failed` with the error recorded in `posts.error`.

## How scheduling decides when to post (the schedule logic)

Driven by `accounts.posts_per_period` + `accounts.period` (e.g. "5 per week").
Logic lives in `supabase/functions/_shared/schedule.ts`:

- `intervalMs` — average gap between posts for the cadence (week → ~1.4 days).
- `nextSlots` — **gap fill.** Looks one period ahead (min 7 days), computes the
  target number of posts, subtracts what's already queued (`pending` +
  `scheduled`), and returns slots only for the shortfall. This is what the daily
  cron uses, so it never over-generates.
- `makeSlots` — exactly N evenly-spaced future slots (used when the dashboard asks
  for a specific count on first run).
- New slots start ~2h out so nothing is "due" the instant it's created.

To change cadence, update the account (the dashboard's frequency selector writes
`posts_per_period` / `period` via `save-settings`).

---

## Twitter / X API access (the "how do users connect X" question)

The publisher needs an **OAuth 2.0 user-context** access token with the
`tweet.write` and `users.read` scopes (app-only/bearer tokens cannot post).

**For the hackathon / single account (fastest):**
1. Create an app at <https://developer.x.com/en/portal/dashboard>.
2. Generate a user **OAuth 2.0** access token with `tweet.write`.
3. Paste it into **Add Brand Materials → X API Token**. It's stored server-side in
   `accounts.x_access_token` (never exposed to the browser), or set the shared
   `X_BEARER_TOKEN` secret to use one team token for everyone.

**For real multi-user (next step, not built yet):** add an OAuth 2.0 + PKCE
"Connect X" flow — redirect users to X, exchange the code for a token in an Edge
Function, store per-account, and refresh on expiry. This replaces pasting tokens.

---

## Operational checklist (owners)

- [ ] **Supabase access** — invite the team in Supabase → *Organization → Team*
      (Settings → Members). Roles: Owner for admins, Developer for the rest.
- [ ] **Schema applied** (`supabase db push`).
- [ ] **Secrets set** (`ANTHROPIC_API_KEY`, X token).
- [ ] **Functions deployed** (all six).
- [ ] **pg_cron enabled** and jobs scheduled.
- [ ] **End-to-end test:** add materials → generate → approve → confirm a real
      tweet posts (use a throwaway X account first).
