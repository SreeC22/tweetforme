import { NextRequest, NextResponse } from "next/server";
import { getAnthropic, MODEL, extractJson, asText } from "@/lib/anthropic";
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
  "summary": string,             // 2-3 sentence portrait of the voice
  "tone": string[],              // 4-6 short descriptors, e.g. "dry", "earnest", "punchy"
  "vocabulary": string[],        // recurring words/phrases the author actually uses
  "structures": string[],        // sentence/post shapes, e.g. "opens with a single-line hook"
  "dos": string[],               // explicit rules to follow when writing as them
  "donts": string[],             // anti-patterns to avoid
  "signature_moves": string[],   // tricks that make a post unmistakably theirs
  "example_openings": string[]   // 4-6 plausible opening lines in their voice
}`;

export async function POST(req: NextRequest) {
  try {
    const { samples } = (await req.json()) as { samples: string[] };
    const cleaned = (samples || [])
      .map((s) => (s || "").trim())
      .filter(Boolean);

    if (cleaned.length < 3) {
      return NextResponse.json(
        { error: "Paste at least 3 of your past posts so we have something to work with." },
        { status: 400 }
      );
    }

    const client = getAnthropic();
    const formatted = cleaned
      .map((s, i) => `--- Post ${i + 1} ---\n${s}`)
      .join("\n\n");

    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 2000,
      system: SYS,
      messages: [
        {
          role: "user",
          content: `Here are my past posts. Build my voice profile.\n\n${formatted}`,
        },
      ],
    });

    const parsed = extractJson<Omit<VoiceProfile, "samples" | "createdAt">>(asText(res));

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
