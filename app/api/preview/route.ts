import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/llm";
import { previewFallback } from "@/lib/preview";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Landing-page preview: a visitor types an idea and gets ONE short draft that
 * ECHOES the voice they typed in — gen-z in, gen-z out; formal in, formal out.
 * No signup, no profile upload. It's a zero-training taste of the core product.
 *
 * Deliberately different from /api/generate:
 *   - one draft (fast + cheap), not six
 *   - no voice profile — the "voice" is inferred from the visitor's own wording
 *   - it NEVER hard-fails: if the LLM key is missing / rate-limited / slow, it
 *     returns an on-topic fallback built from the visitor's own idea (and their
 *     register), so the widget always shows something coherent (HTTP 200,
 *     { live: false }).
 */

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

export async function POST(req: NextRequest) {
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
  if (idea.length > 400) idea = idea.slice(0, 400);

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
    return NextResponse.json({ draft, live: true });
  } catch {
    // Never leave a landing-page visitor with an error or an off-topic draft.
    return NextResponse.json({ draft: previewFallback(idea), live: false });
  }
}
