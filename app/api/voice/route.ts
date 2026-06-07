import { NextRequest, NextResponse } from "next/server";
import { chat, extractJson } from "@/lib/llm";
import type { VoiceProfile } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYS = `You are a brand-voice analyst for creators on X (Twitter) and Threads.
You will receive 5-20 of the creator's past posts.
Your job: distill their **voice DNA** — what makes their writing recognizably theirs.

Be specific. Avoid generic words like "engaging" or "authentic". Name actual patterns,
phrases, sentence shapes, opinions, mannerisms. If the writer uses lowercase, says
"tbh", opens with one-liners, uses dashes, swears, hates emoji, etc. — capture it.

Return ONLY a JSON object matching this TypeScript type, with no prose:
{
  "summary": string,
  "tone": string[],
  "vocabulary": string[],
  "structures": string[],
  "dos": string[],
  "donts": string[],
  "signature_moves": string[],
  "example_openings": string[]
}`;

export async function POST(req: NextRequest) {
  try {
    const { samples } = (await req.json()) as { samples: string[] };
    const cleaned = (samples || []).map((s) => (s || "").trim()).filter(Boolean);

    if (cleaned.length < 3) {
      return NextResponse.json(
        { error: "Paste at least 3 of your past posts so we have something to work with." },
        { status: 400 }
      );
    }

    const formatted = cleaned.map((s, i) => `--- Post ${i + 1} ---\n${s}`).join("\n\n");

    const raw = await chat({
      system: SYS,
      prompt: `Here are my past posts. Build my voice profile.\n\n${formatted}`,
      maxTokens: 2000,
    });

    const parsed = extractJson<Omit<VoiceProfile, "samples" | "createdAt">>(raw);
    const profile: VoiceProfile = {
      ...parsed,
      samples: cleaned,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ profile });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
