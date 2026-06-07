// Thin Anthropic (Claude) client for the Edge runtime — plain fetch, no SDK.
//
// Model: defaults to the latest Sonnet, overridable with the CLAUDE_MODEL secret.
// Set the key once:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

export const CLAUDE_MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-sonnet-4-6";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

interface ClaudeOpts {
  system?: string;
  maxTokens?: number;
  model?: string;
  temperature?: number;
}

/** Call Claude and return the concatenated text content. */
export async function claude(prompt: string, opts: ClaudeOpts = {}): Promise<string> {
  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Run: supabase secrets set ANTHROPIC_API_KEY=sk-ant-...",
    );
  }

  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: opts.model ?? CLAUDE_MODEL,
      max_tokens: opts.maxTokens ?? 2048,
      temperature: opts.temperature,
      system: opts.system,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Claude API ${res.status}: ${detail}`);
  }

  const data = await res.json();
  return (data.content ?? [])
    .map((c: { type: string; text?: string }) => (c.type === "text" ? c.text : ""))
    .join("")
    .trim();
}

/**
 * Parse the first JSON value out of a model response, tolerant of code fences
 * or stray prose. Works for both objects ({...}) and arrays ([...]).
 */
export function extractJson<T = unknown>(text: string): T {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  let candidate = (fenced ? fenced[1] : text).trim();

  // Find the outermost JSON token, object or array, whichever comes first.
  const firstObj = candidate.indexOf("{");
  const firstArr = candidate.indexOf("[");
  const starts = [firstObj, firstArr].filter((i) => i >= 0);
  if (starts.length === 0) throw new Error("Model did not return JSON.");
  const start = Math.min(...starts);
  const openChar = candidate[start];
  const closeChar = openChar === "{" ? "}" : "]";
  const end = candidate.lastIndexOf(closeChar);
  if (end <= start) throw new Error("Model did not return well-formed JSON.");

  return JSON.parse(candidate.slice(start, end + 1)) as T;
}
