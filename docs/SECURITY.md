# Security — protecting the public preview (and the shared LLM key)

The landing widget (`/api/preview`) spends **one shared Groq key** on behalf of
anonymous visitors. That's a classic abuse target, so it's defended in layers.
Rate limiting a public LLM endpoint by IP alone is not enough (IPs rotate), so
we combine code-level limits, a same-origin guard, graceful degradation, and
edge-level rules.

## What's enforced in code (already shipped)

| Layer | Where | Effect |
|---|---|---|
| **Same-origin guard** | `app/api/preview/route.ts` → `originAllowed()` | Rejects requests whose `Origin` isn't our site (`*.vercel.app`, localhost, or `NEXT_PUBLIC_SITE_HOST`). Blocks other sites' browsers from spending the key. |
| **Input caps** | route | Idea trimmed to 400 chars; empty → 400. Bounds token spend per call. |
| **In-memory burst guard** | `lib/server/ratelimit.ts` | Instant per-instance cap (10 / 60s). Zero-dependency first line. |
| **Shared sliding window** | `rate_limit_check()` (Postgres) | Cross-instance cap (10 / 60s per **hashed** IP). Catches clients that hop serverless instances. |
| **Graceful over-limit** | route | Over the cap → returns the on-topic *fallback* draft (HTTP 200, `limited:true`). No error leaked, **no call to the shared key**. |
| **No PII** | limiter + `preview_tries` | IPs are SHA-256 hashed for the rate bucket; logs store idea + voice only — no IP, no email. |
| **Fail-open** | limiter | A limiter/infra bug never takes down the widget (worst case: a few extra calls, still bounded by Groq's own key limits). |

Tunable in `app/api/preview/route.ts`: `RATE_MAX`, `RATE_WINDOW_SECONDS`, `IDEA_MAX`.

## What to enable in the dashboards (strongest layer — needs you)

1. **Vercel WAF rate-limit rule** (edge, runs *before* the function — best key
   protection, available on all plans incl. Hobby):
   Vercel → Project → **Firewall** → **Configure** → add a **Rate Limit** rule
   targeting path `/api/preview`, e.g. **20 requests / 60s per IP**, action
   *Deny* (or *Challenge*). This stops floods before they cost an invocation.
2. **Attack Challenge Mode** (Firewall → toggle) — flip on if you ever see a
   traffic spike; it challenges suspicious clients with no code change.
3. **Groq usage guard** — in the Groq console, keep the preview on a key with
   the free-tier limits (it self-throttles), and watch usage. Our fallback
   means hitting the Groq limit degrades gracefully instead of erroring.
4. **Supabase** — `preview_tries` and `rate_limit_hits` have RLS on with no anon
   policies, so the browser (anon key) can't read them; only server routes
   (service role) touch them. Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side.

## Run the migrations

The rate limiter and the try-log need two tables + one function:

```
supabase db push          # applies supabase/migrations/*
# or paste 20260703000001_preview_tries.sql and 20260703000002_rate_limit.sql
# into the Supabase SQL editor
```

Until they exist, logging and the shared limiter no-op (fail-open) — the
in-memory guard and the same-origin check still apply.
