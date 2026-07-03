import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/llm";
import { previewFallback, detectRegister } from "@/lib/preview";
import { getSupabase } from "@/lib/server/supabase";
import { allowRequest, clientIp, ipBucket } from "@/lib/server/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Landing-page preview: a visitor types an idea and gets ONE short draft that
 * ECHOES the voice they typed in — gen-z in, gen-z out; formal in, formal out.
 * No signup, no profile upload. A zero-training taste of the core product.
 *
 * This endpoint spends a SHARED LLM key, so it's hardened against abuse:
 *   - same-origin guard (blocks other sites' browsers hitting it)
 *   - input caps (length)
 *   - layered rate limit (in-memory + shared Postgres sliding window)
 *   - graceful over-limit: serve the fallback (HTTP 200), never an error and
 *     never a call to the shared key
 * The strongest layer is the Vercel WAF rate-limit rule (edge, before this runs)
 * — configured in the dashboard; see docs/SECURITY.md.
 *
 * Never hard-fails: on missing key / rate-limit / slow LLM it returns an
 * on-topic fallback built from the visitor's own idea ({ live: false }).
 */

const IDEA_MAX = 400;
const RATE_MAX = 10; // requests …
const RATE_WINDOW_SECONDS = 60; // … per minute, per hashed IP

const SYS = `You rewrite a raw idea into ONE short X (Twitter) post.

THE MOST IMPORTANT RULE: mirror the VOICE of how the user wrote their idea.
Match their register, slang, capitalization, punctuation, emoji habits, and energy.
- gen-z slang in  -> gen-z slang out ("fr", "ngl", "lowkey", "it's giving", "mid")
- all-lowercase, loose punctuation in -> keep it lowercase and loose
- polished, capitalized, "Thoughts?" in -> keep it professional and clean
Write the post as if THEY wrote it on their best day.

Other rules:
- 240 characters or fewer. exactly ONE post. no options, no preamble.
- no hashtags unless they used hashtags. no emoji unless they used emoji.
- never use generic AI openers ("in today's world", "excited to share", "let's dive in").
- keep it specific to their idea and end on a strong line.
Return ONLY the post text — no surrounding quotes, no explanation.`;

/** Block other websites' browsers from spending our key. Non-browser callers
 *  (no Origin header) fall through to the rate limiter. */
function originAllowed(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const host = new URL(origin).host;
    const allow =
      host.endsWith(".vercel.app") ||
      host.startsWith("localhost") ||
      host === "127.0.0.1" ||
      host === process.env.NEXT_PUBLIC_SITE_HOST;
    return Boolean(allow);
  } catch {
    return false;
  }
}

/** Fire-and-forget: record what was tried (idea + voice + live/fallback). No PII. */
function logTry(idea: string, register: string, live: boolean) {
  const sb = getSupabase();
  if (!sb) return;
  void sb
    .from("preview_tries")
    .insert({ idea: idea.slice(0, IDEA_MAX), register, live })
    .then(
      () => {},
      () => {},
    );
}

export async function POST(req: NextRequest) {
  if (!originAllowed(req)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  let idea = "";
  try {
    const body = (await req.json()) as { idea?: string };
    idea = (body.idea || "").trim();
  } catch {
    /* fall through to the empty-idea guard */
  }

  if (!idea) {
    return NextResponse.json({ error: "Give us an idea to riff on." }, { status: 400 });
  }
  if (idea.length > IDEA_MAX) idea = idea.slice(0, IDEA_MAX);

  const register = detectRegister(idea);

  // Rate limit — over the cap, still hand back a coherent draft, but skip the
  // shared LLM entirely so the key is protected.
  const bucket = ipBucket(clientIp(req));
  const allowed = await allowRequest(bucket, RATE_MAX, RATE_WINDOW_SECONDS);
  if (!allowed) {
    logTry(idea, register, false);
    return NextResponse.json({ draft: previewFallback(idea), live: false, limited: true });
  }

  try {
    const raw = await chat({
      system: SYS,
      prompt: `Match the voice of exactly how I wrote this — same slang, casing, punctuation, energy:
"""
${idea}
"""

Write one X post about that idea, in my voice.`,
      maxTokens: 220,
      temperature: 0.9,
    });

    let draft = raw.trim().replace(/^["'“”]+|["'“”]+$/g, "").trim();
    if (!draft) throw new Error("empty completion");
    if (draft.length > 280) draft = draft.slice(0, 277) + "…";
    logTry(idea, register, true);
    return NextResponse.json({ draft, live: true });
  } catch {
    // Never leave a landing-page visitor with an error or an off-topic draft.
    logTry(idea, register, false);
    return NextResponse.json({ draft: previewFallback(idea), live: false });
  }
}
