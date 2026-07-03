import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/llm";
import { DEMO_PROFILE } from "@/lib/demo";
import { previewFallback } from "@/lib/preview";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Landing-page preview: a visitor types an idea and gets ONE short draft in a
 * fixed sample creator's voice — no signup, no profile upload.
 *
 * Deliberately different from /api/generate:
 *   - one draft (fast + cheap), not six
 *   - the visitor never sends a voice profile — we use the seeded DEMO_PROFILE
 *   - it NEVER hard-fails: if the LLM key is missing / rate-limited / slow, it
 *     returns an on-topic fallback built from the visitor's own idea, so the
 *     widget always shows something coherent (HTTP 200 with { live: false }).
 */

const SYS = `You write a SINGLE short X (Twitter) post that sounds exactly like this creator.
Rules:
- 240 characters or fewer.
- lowercase, punchy, declarative. no hashtags, no emoji.
- no generic AI openers ("in today's world", "excited to share", "let's dive in").
- one bold claim, concrete, ends on a punch.
Return ONLY the post text — no surrounding quotes, no preamble, no explanation.`;

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

  const p = DEMO_PROFILE;
  try {
    const raw = await chat({
      system: SYS,
      prompt: `VOICE SUMMARY: ${p.summary}
SIGNATURE MOVES: ${p.signature_moves.join("; ")}

IDEA TO POST ABOUT:
${idea}

Write one post about that idea, unmistakably in their voice.`,
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
