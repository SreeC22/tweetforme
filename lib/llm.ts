// Provider-agnostic LLM client for the Next.js server routes.
// ----------------------------------------------------------------------------
// Free by default (Groq) so the deployed app runs at zero cost; flip to Claude
// for top voice quality with one env var. Mirrors the Edge client in
// supabase/functions/_shared/llm.ts so both surfaces behave identically.
//
// Pick the provider with LLM_PROVIDER:
//   groq    (free,  https://console.groq.com/keys)         — default
//   gemini  (free,  https://aistudio.google.com/apikey)
//   openai | openrouter | together  (mixed)
//   anthropic (paid, top quality — uses the official SDK)
//
// Then set that provider's key (e.g. GROQ_API_KEY). Override the model with
// LLM_MODEL, or the whole endpoint with LLM_BASE_URL + LLM_API_KEY.

import { getAnthropic, asText } from "@/lib/anthropic";

// extractJson lives in lib/anthropic.ts; re-export so routes have one import.
export { extractJson } from "@/lib/anthropic";

type Provider = "groq" | "gemini" | "openai" | "openrouter" | "together" | "anthropic";

interface Preset {
  base: string;
  model: string;
  keyEnv: string;
  keysUrl: string;
}

const PRESETS: Record<Exclude<Provider, "anthropic">, Preset> = {
  groq: {
    base: "https://api.groq.com/openai/v1",
    model: "llama-3.3-70b-versatile",
    keyEnv: "GROQ_API_KEY",
    keysUrl: "https://console.groq.com/keys",
  },
  gemini: {
    base: "https://generativelanguage.googleapis.com/v1beta/openai",
    model: "gemini-2.0-flash",
    keyEnv: "GEMINI_API_KEY",
    keysUrl: "https://aistudio.google.com/apikey",
  },
  openai: {
    base: "https://api.openai.com/v1",
    model: "gpt-4o-mini",
    keyEnv: "OPENAI_API_KEY",
    keysUrl: "https://platform.openai.com/api-keys",
  },
  openrouter: {
    base: "https://openrouter.ai/api/v1",
    model: "meta-llama/llama-3.3-70b-instruct",
    keyEnv: "OPENROUTER_API_KEY",
    keysUrl: "https://openrouter.ai/keys",
  },
  together: {
    base: "https://api.together.xyz/v1",
    model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
    keyEnv: "TOGETHER_API_KEY",
    keysUrl: "https://api.together.xyz/settings/api-keys",
  },
};

function provider(): Provider {
  const p = (process.env.LLM_PROVIDER ?? "").toLowerCase().trim();
  if (p) return p as Provider;
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GROQ_API_KEY) return "groq";
  if (process.env.GEMINI_API_KEY) return "gemini";
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.OPENROUTER_API_KEY) return "openrouter";
  if (process.env.TOGETHER_API_KEY) return "together";
  return "groq";
}

/** Human-readable "provider · model" for logs. */
export function providerLabel(): string {
  const p = provider();
  if (p === "anthropic") {
    return `anthropic · ${process.env.LLM_MODEL ?? "claude-sonnet-4-6"}`;
  }
  return `${p} · ${process.env.LLM_MODEL ?? PRESETS[p]?.model ?? "?"}`;
}

export interface ChatOpts {
  system?: string;
  prompt: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

/** Call the active LLM and return its text. Throws a clear error if no key is set. */
export async function chat(opts: ChatOpts): Promise<string> {
  const p = provider();

  if (p === "anthropic") {
    const client = getAnthropic();
    const res = await client.messages.create({
      model: opts.model ?? process.env.LLM_MODEL ?? "claude-sonnet-4-6",
      max_tokens: opts.maxTokens ?? 2048,
      system: opts.system,
      messages: [{ role: "user", content: opts.prompt }],
    });
    return asText(res);
  }

  const preset = PRESETS[p];
  if (!preset) {
    throw new Error(
      `Unknown LLM_PROVIDER "${p}". Use one of: ${Object.keys(PRESETS).join(", ")}, anthropic.`,
    );
  }

  const base = process.env.LLM_BASE_URL ?? preset.base;
  const model = opts.model ?? process.env.LLM_MODEL ?? preset.model;
  const apiKey = process.env.LLM_API_KEY ?? process.env[preset.keyEnv];
  if (!apiKey) {
    throw new Error(
      `No API key for LLM provider "${p}". Set ${preset.keyEnv} (free key: ${preset.keysUrl}).`,
    );
  }

  const r = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens ?? 2048,
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      messages: [
        ...(opts.system ? [{ role: "system" as const, content: opts.system }] : []),
        { role: "user" as const, content: opts.prompt },
      ],
    }),
  });

  if (!r.ok) {
    throw new Error(`${p} API ${r.status}: ${await r.text()}`);
  }

  const data = await r.json();
  return String(data?.choices?.[0]?.message?.content ?? "").trim();
}
