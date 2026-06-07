# echo

> **Your voice. On autopilot.**

Paste your past posts. We learn your voice. Then we draft and publish to **X** and **Threads** — without the AI smell.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI | Claude (Anthropic SDK) |
| Publishing | X API v2, Threads Graph API |
| Hosting | Vercel |

---

## Project Structure

```
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout, fonts, meta
│   ├── globals.css               # Global styles + design tokens
│   ├── train/
│   │   └── page.tsx              # Voice training UI
│   ├── generate/
│   │   └── page.tsx              # Draft generation + publish UI
│   └── api/
│       ├── waitlist/route.ts     # Email capture + webhook relay
│       ├── voice/route.ts        # Voice profile extraction (Claude)
│       ├── generate/route.ts     # Draft generation (Claude)
│       ├── post-x/route.ts       # Publish to X via API v2
│       └── post-threads/route.ts # Publish to Threads via Graph API
├── components/
│   ├── waitlist/
│   │   └── WaitlistForm.tsx      # Email form + share buttons
│   ├── voice/
│   │   └── TrainFlow.tsx         # Paste posts → extract voice
│   └── generate/
│       └── GenerateFlow.tsx      # Idea → drafts → publish
├── lib/
│   ├── anthropic.ts              # Claude client utilities
│   └── types.ts                  # Shared types
├── public/                       # Static assets
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

See `.env.example` for the full list. Only `WAITLIST_WEBHOOK_URL` is needed for the landing page — the rest power the AI generation and publishing features.

---

## Features

1. **Voice Training** — Paste 10-20 past posts. Claude extracts a Voice Profile (tone, vocabulary, sentence patterns, signature moves).

2. **Draft Generation** — Drop in a raw idea. Get 3 X drafts (including a thread) and 2 Threads drafts — all in your voice.

3. **One-Tap Publish** — Post directly via X API v2 and Threads Graph API, or open in the platform's native composer.

---

## Backend (the live content pipeline)

The product backend runs **entirely on Supabase** — Postgres + Edge Functions +
pg_cron. The dashboard (`content-pipeline.html`) reads/writes Supabase directly and
calls Edge Functions for anything needing a secret.

```
supabase/
├── migrations/        # posts, voice_profiles, accounts (+ RLS) and the cron jobs
└── functions/
    ├── _shared/       # claude, x, db, prompts, schedule, publish, cors
    ├── analyze-voice/     # learn + persist a brand voice from sample posts
    ├── generate-tweets/   # draft tweets in-voice, queue them as "pending"
    ├── regenerate-tweet/  # rewrite one post, send back to review
    ├── save-settings/     # store X token + posting schedule (server-side)
    ├── publish-now/       # manual override: post an approved tweet now
    └── publish-due/       # cron: auto-publish approved tweets at their time
```

**Flow:** add brand materials → voice learned → tweets generated → human approves
→ auto-published at the scheduled time (only approved posts ever send).

👉 **Setup + deploy:** [`docs/GOING_LIVE.md`](docs/GOING_LIVE.md)

The repo also ships Claude Code agents in `.claude/agents/` (code-writer,
code-reviewer, code-maintainer, supabase-engineer, voice-prompt-engineer).

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Import the repo
2. Add environment variables
3. Deploy

---

## License

MIT
