# tweetforme

> _Your voice. On autopilot._
> Paste 10 of your past posts. We learn your voice. Then we draft and publish to **X** and **Threads** — without the AI smell.

## What's live right now

**Waitlist** at `/` — email capture, share-on-X / share-on-Threads buttons, optional webhook ping on every signup. Ship this first to start collecting demand.

## What's built but dormant

The full product code lives in the repo and will work the moment you set `ANTHROPIC_API_KEY` and link to the routes:

- `/train` — paste past posts, Claude extracts a Voice Profile, stored in browser `localStorage`.
- `/generate` — drop in an idea, get 3 X drafts (one as a thread) + 2 Threads drafts in your voice. Edit, copy, or one-tap publish.
- `/api/voice`, `/api/generate` — Claude-backed.
- `/api/post-x`, `/api/post-threads` — official X API v2 and Meta Threads Graph publishing.

See [`PRD.md`](./PRD.md) for the full product vision and roadmap.

---

## Quick start

```bash
npm install
cp .env.example .env.local   # add WAITLIST_WEBHOOK_URL (optional) for now
npm run dev
```

Open <http://localhost:3000>.

---

## Env vars

| Var | What it does |
|---|---|
| `WAITLIST_WEBHOOK_URL` | Optional. Every signup is POSTed to this URL — point at a Slack / Discord incoming webhook or a Zapier/Make hook to get pinged in real time. |
| `ANTHROPIC_API_KEY` | Needed for `/train` and `/generate`. Get one at <https://console.anthropic.com>. |
| `X_BEARER_TOKEN` | Optional. OAuth 2.0 user-context token with `tweet.write` + `users.read`. From <https://developer.x.com>. |
| `THREADS_USER_ID` + `THREADS_ACCESS_TOKEN` | Optional. Long-lived Meta Threads Graph token. See <https://developers.facebook.com/docs/threads>. |

If publishing tokens aren't set, the generator still works — every draft has an **Open in compose** button that pre-fills the platform's composer.

---

## Deploying to Vercel

```bash
git push -u origin main
```

Then on <https://vercel.com/new>:

1. Import the repo.
2. (Optional now) add `WAITLIST_WEBHOOK_URL`.
3. (Later) add `ANTHROPIC_API_KEY` + X/Threads tokens to flip on the product.
4. Deploy. ~60 seconds to a shareable URL.

For real waitlist persistence beyond a serverless container's lifetime, swap the in-`/tmp` storage in `app/api/waitlist/route.ts` for Vercel KV / Postgres / a Google Sheet via Zapier.

---

## Layout

```
app/
  page.tsx                 ← waitlist landing (LIVE)
  train/page.tsx           ← voice training UI (dormant — no link from /)
  generate/page.tsx        ← generator + publish UI (dormant — no link from /)
  api/
    waitlist/route.ts      ← captures emails (LIVE)
    voice/route.ts         ← Claude voice extraction (dormant until ANTHROPIC_API_KEY)
    generate/route.ts      ← Claude draft generation (dormant)
    post-x/route.ts        ← X API v2 publish (dormant until token)
    post-threads/route.ts  ← Threads Graph publish (dormant until token)
components/
  WaitlistForm.tsx         ← LIVE
  TrainFlow.tsx            ← dormant
  GenerateFlow.tsx         ← dormant
lib/
  anthropic.ts, types.ts   ← dormant
```

To flip the product on later: add a link from `app/page.tsx` to `/train`, set the env vars on Vercel, redeploy. No code rewrite needed.
