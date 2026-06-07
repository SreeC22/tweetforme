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
- Do NOT start with "In today's world", "Let's dive in", "Excited to share",
  "I'm humbled to announce", or any generic AI / LinkedIn-smell opener.
- Match the creator's tone, vocabulary, punctuation, and structural moves on EVERY platform.
- X: <= 270 characters. A thread is 2-5 short tweets.
- Threads: 1-4 short paragraphs, max ~500 chars total.
- LinkedIn: 1-3 short paragraphs in THEIR voice — never corporate, no buzzwords,
  no "agree?" engagement bait. A little more room to breathe, up to ~1200 chars.
  Line breaks between thoughts are fine. It should read like them, just longer.

Return ONLY a JSON object of this shape, no prose:
{
  "drafts": [
    { "platform": "x",        "text": "..." },
    { "platform": "x",        "text": "..." },
    { "platform": "x",        "text": "...", "thread": ["tweet 1", "tweet 2", "tweet 3"], "note": "thread variant" },
    { "platform": "threads",  "text": "..." },
    { "platform": "linkedin", "text": "..." },
    { "platform": "linkedin", "text": "..." }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { idea, profile, feedback } = (await req.json()) as {
      idea: string;
      profile: VoiceProfile;
      feedback?: string[];
    };

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

    const fb = Array.isArray(feedback) ? feedback.filter(Boolean) : [];
    const feedbackBlock = fb.length
      ? `\n\nHONOR THIS FEEDBACK the user gave on earlier drafts (most important):\n${fb.map((f) => `- ${f}`).join("\n")}`
      : "";

    const raw = await chat({
      system: SYS,
      prompt: `VOICE PROFILE:\n${profileBlock}\n\nORIGINAL SAMPLES (for tone reference):\n${samplePosts}\n\nIDEA TO POST ABOUT:\n${idea.trim()}${feedbackBlock}\n\nGive me 3 X drafts (one a short thread), 1 Threads post, and 2 LinkedIn posts — all unmistakably in their voice.`,
      maxTokens: 2600,
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
