import { NextRequest, NextResponse } from "next/server";
import { chat, extractJson } from "@/lib/llm";
import type { Draft, VoiceProfile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYS = `You write social posts that sound exactly like a specific creator.
You receive (a) their voice profile and (b) a raw idea.

Produce posts that match their voice DNA so well a reader would not guess AI wrote them.
Hard rules:
- Do NOT use hashtags unless the voice profile explicitly uses them.
- Do NOT use emoji unless the voice profile explicitly uses them.
- Do NOT start with "In today's world", "Let's dive in", "Excited to share", or any
  generic LinkedIn-AI-smell opener.
- Match the creator's tone, vocabulary, punctuation, and structural moves.
- Tweets must be <= 270 characters (leave breathing room).
- Threads posts can be 1-4 short paragraphs, max ~500 chars total.

Return ONLY a JSON object of this shape, no prose:
{
  "drafts": [
    { "platform": "x",       "text": "..." },
    { "platform": "x",       "text": "..." },
    { "platform": "x",       "text": "...", "thread": ["tweet 1", "tweet 2", "tweet 3"], "note": "thread variant" },
    { "platform": "threads", "text": "..." },
    { "platform": "threads", "text": "..." }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { idea, profile } = (await req.json()) as { idea: string; profile: VoiceProfile };

    if (!idea || !idea.trim()) {
      return NextResponse.json({ error: "Give us an idea to riff on." }, { status: 400 });
    }
    if (!profile) {
      return NextResponse.json(
        { error: "Train your voice first — head to /train." },
        { status: 400 }
      );
    }

    const profileBlock = JSON.stringify(
      {
        summary: profile.summary,
        tone: profile.tone,
        vocabulary: profile.vocabulary,
        structures: profile.structures,
        dos: profile.dos,
        donts: profile.donts,
        signature_moves: profile.signature_moves,
        example_openings: profile.example_openings,
      },
      null,
      2
    );

    const samplePosts = (profile.samples || [])
      .slice(0, 8)
      .map((s, i) => `--- Sample ${i + 1} ---\n${s}`)
      .join("\n\n");

    const raw = await chat({
      system: SYS,
      prompt: `VOICE PROFILE:\n${profileBlock}\n\nORIGINAL SAMPLES (for tone reference):\n${samplePosts}\n\nIDEA TO POST ABOUT:\n${idea.trim()}\n\nGive me 3 X drafts (one of them a short thread) and 2 Threads drafts.`,
      maxTokens: 1800,
    });

    const parsed = extractJson<{ drafts: Draft[] }>(raw);
    const drafts = parsed.drafts.map((d) => {
      if (d.platform === "x" && d.text && d.text.length > 280) {
        return { ...d, text: d.text.slice(0, 277) + "…" };
      }
      return d;
    });

    return NextResponse.json({ drafts });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
