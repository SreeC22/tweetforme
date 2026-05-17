# tweetforme

> _Your voice. On autopilot._
> Paste 10 of your past posts. We learn your voice. Then we draft and publish to **X** and **Threads** — without the AI smell.

This repo contains:

- 🌐 A **waitlist landing page** at `/` — ship this first to start collecting signups.
- 🧬 A **voice-training** flow at `/train` — paste past posts → get a Voice Profile.
- ✍️ A **generator** at `/generate` — drop an idea → 3 X drafts + 2 Threads drafts in your voice.
- 🚀 **One-tap publishing** to X and Threads via their official APIs (token-gated).

See [`PRD.md`](./PRD.md) for the full product vision and roadmap.

---

## Quick start

```bash
npm install
cp .env.example .env.local      # then add your ANTHROPIC_API_KEY at minimum
npm run dev
```

Then open <http://localhost:3000>.

---

## Env vars

| Var | Required for | What it does |
|---|---|---|
| `ANTHROPIC_API_KEY` | voice training + generation | Calls Claude to extract your voice profile and write drafts. Get one at <https://console.anthropic.com>. |
| `X_BEARER_TOKEN` | auto-post to X | OAuth 2.0 **user-context** token with `tweet.write` + `users.read`. From <https://developer.x.com>. |
| `THREADS_USER_ID` | auto-post to Threads | Your numeric Threads user id. |
| `THREADS_ACCESS_TOKEN` | auto-post to Threads | Long-lived user access token from the Meta Threads Graph API. See <https://developers.facebook.com/docs/threads>. |
| `WAITLIST_WEBHOOK_URL` | optional | If set, every waitlist signup is POSTed to this URL. Point at a Slack/Discord incoming webhook or a Zapier/Make hook to get pinged in real time. |

If publishing tokens aren't set, the app gracefully degrades — every draft still has an **Open in compose** button that pre-fills the platform's composer.

---

## Deploying to Vercel

The fastest path to a shareable URL:

```bash
git init && git add -A && git commit -m "tweetforme: initial waitlist + product MVP"
git remote add origin https://github.com/SreeC22/tweetforme.git
git push -u origin main
```

Then on <https://vercel.com/new>:

1. Import the GitHub repo.
2. Add `ANTHROPIC_API_KEY` (and optionally `WAITLIST_WEBHOOK_URL`) in **Environment Variables**.
3. Deploy. You'll have a `tweetforme-xxx.vercel.app` URL in ~60 seconds.
4. Add the X / Threads tokens later, once you've gotten through the developer-portal flow.

You can share the deploy URL the moment Step 3 finishes — the waitlist works without any platform tokens.

---

## Architecture

```
app/
  page.tsx                 ← waitlist landing
  train/page.tsx           ← voice training UI
  generate/page.tsx        ← generator + publish UI
  api/
    waitlist/route.ts      ← captures emails (webhook + local file)
    voice/route.ts         ← Claude extracts voice profile
    generate/route.ts      ← Claude writes drafts in voice
    post-x/route.ts        ← X API v2 publish (single tweet or thread)
    post-threads/route.ts  ← Threads Graph API two-step publish
components/
  WaitlistForm.tsx
  TrainFlow.tsx
  GenerateFlow.tsx
lib/
  anthropic.ts             ← Claude client + JSON parsing helpers
  types.ts                 ← Shared TS types
```

The Voice Profile lives in your browser's `localStorage` (key
`tweetforme:voice-profile`). No accounts, no DB — yet. See the PRD for the
roadmap.

---

## Why we built this in 3 hours

Because the only thing better than shipping a product is shipping the
waitlist for the product before the product is finished.
