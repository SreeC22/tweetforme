import Anthropic from "@anthropic-ai/sdk";

let cached: Anthropic | null = null;

export function getAnthropic(): Anthropic {
  if (cached) return cached;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY. Add it to .env.local (see .env.example)."
    );
  }
  cached = new Anthropic({ apiKey });
  return cached;
}

export const MODEL = "claude-sonnet-4-5";

/** Flatten a Messages API response down to its plain text content. */
export function asText(res: Anthropic.Message): string {
  return res.content
    .map((c) => ("text" in c ? c.text : ""))
    .filter(Boolean)
    .join("");
}

/**
 * Extract the first {...} JSON object from a model response, tolerant of
 * code-fences or surrounding prose.
 */
export function extractJson<T = unknown>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Model did not return JSON.");
  }
  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
