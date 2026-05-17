# echo — PRD

**One-liner:** _Your voice. On autopilot._
Paste 10 of your past posts. We learn your voice. Then we draft and publish to **X** and **Threads** for you — without the AI smell.

---

## 1. Why now

- Personal-brand creators are the new growth channel for solo founders, indie hackers, course creators, and entrepreneurs. Short-form is the funnel.
- The bar to "post consistently" is the single biggest reason creators quit. ~60% of creators say they stop because of fatigue, not lack of ideas.
- Generic AI writers (ChatGPT, Jasper, Hypefury templates) all sound the same — that distinct LinkedIn-AI-smell. Audiences smell it. Engagement tanks.
- Threads is the fastest-growing short-form platform of the last 18 months and X is still the entrepreneur watering-hole. Anyone serious about a personal brand needs both.

The wedge: **a generator that sounds like _you_, not like AI**, on the two platforms that actually move the needle for personal brands.

---

## 2. Who it's for

**Primary persona — "The reluctant poster"**
- Solo founder / indie hacker / coach / creator, 25-40.
- Knows posting daily would 10× their inbound, but doesn't have 45 minutes a day.
- Has 20-100 past posts that are actually good — a voice already exists.
- Will pay $20-40/month to not have to think about it.

**Secondary persona — "The newsletter writer"**
- Already writes longer-form (Substack, blog, podcast).
- Wants short-form distribution without rewriting everything.

---

## 3. The problem

1. Posting consistently on X + Threads is a part-time job.
2. Existing AI writers produce posts that are recognizably AI — wrong tone, wrong structure, wrong vocabulary. Posting them hurts the brand more than skipping a day.
3. Cross-posting between X and Threads is awkward — different lengths, different cultures, different rhythms.

---

## 4. The solution (MVP)

A web app that does three things, very well:

1. **Voice training.** User pastes 10-20 of their past posts. We extract a **Voice Profile** (tone, vocabulary, sentence structures, signature moves, do's and don'ts) using Claude. Stored locally to start (browser localStorage), portable as JSON.
2. **Generation.** User drops in a raw idea, URL, or rough sentence. We produce 3 X drafts (one as a short thread) and 2 Threads drafts — all in their voice, platform-optimized.
3. **One-tap publish.** Connect X and Threads once. Hit "Post" on any draft and it goes live. Threads use the official Graph API; X uses API v2 with OAuth 2.0.

---

## 5. MVP scope (the 3-hour build)

**In:**
- Waitlist landing page with email capture (ships first, starts traction).
- Voice-train flow (paste posts → profile JSON, stored client-side).
- Generator (idea in → 5 drafts out, regenerate, edit, copy).
- One-tap publish to X and Threads via env-configured tokens.
- "Open in compose" fallback so the demo works without OAuth.

**Out (deferred):**
- Multi-user accounts / sign-in.
- Scheduling / queue / calendar view.
- LinkedIn (later — focus on short-form first).
- Analytics on what worked.
- Image generation / thread-to-carousel.
- Team workspaces.

---

## 6. Post-MVP roadmap

| Phase | Theme | Headline features |
|-------|-------|-------------------|
| v0.2 | Memory | Save Voice Profiles per user, multiple voices per account, share-link a profile |
| v0.3 | Scheduling | Queue + best-time-to-post + auto-spacer |
| v0.4 | Inspiration | Daily idea drops from your bookmarks, newsletters, podcasts |
| v0.5 | Performance loop | Auto-ingest engagement, learn which patterns work, weight future drafts |
| v0.6 | LinkedIn + Threads carousels | Long-form distribution layer |
| v1.0 | Team mode | Ghostwriters, approvers, brand workspaces |

---

## 7. Success metrics

**Pre-launch (waitlist phase, this week):**
- 500 emails on the waitlist.
- ≥ 20% share-rate (post-signup share button clicks).

**MVP launch (next 2 weeks):**
- 50 trained voice profiles.
- 500 drafts generated.
- 100 posts auto-published.
- ≥ 30% D7 retention.

**v1.0 (3 months):**
- 1,000 weekly active creators.
- $5k MRR.

---

## 8. Risks & mitigations

- **API access (X / Threads):** Both have changed terms recently. Mitigation: scope to user-context OAuth (no platform-level rate-limit blast radius); make compose-link fallback always work.
- **AI smell creeps back in:** Mitigation: extract explicit "don't" rules from the voice profile and enforce them in the system prompt; include raw samples in every generation call.
- **Voice profile drift across topics:** Mitigation: weight the most stylistically-similar samples per idea.
- **Spam concerns:** Mitigation: human-in-loop until v0.3 (no fully-automated firing into the void).

---

## 9. Why this wins

- **Sharp wedge:** "Posts in your voice, auto-published" is one sentence anyone with a personal brand instantly understands.
- **Built-in growth loop:** Every post published is implicit social proof — we can add an optional "drafted with echo" line later.
- **Defensible moat:** The Voice Profile is real user-trained data that's awkward to take elsewhere. The longer they use it, the better it gets.
