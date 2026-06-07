// Provider-agnostic LLM client for the Edge runtime.
// ----------------------------------------------------------------------------
// The pipeline runs on whatever model you point it at. The default is a FREE
// provider (Groq) so you can go live at zero cost; flip to Claude for top voice
// quality with one secret. Everything goes through llm() — callers don't care
// who's behind it.
//
// Pick the provider with the LLM_PROVIDER secret:
//   groq    (free,   https://console.groq.com/keys)        — default
//   gemini  (free,   https://aistudio.google.com/apikey)
//   openai  (paid,   https://platform.openai.com/api-keys)
//   openrouter | together  (mixed free/paid)
//   anthropic (paid, top quality — uses the native client in claude.ts)
//
// Then set that provider's key (e.g. GROQ_API_KEY). Override the model with
// LLM_MODEL, or the whole endpoint with LLM_BASE_URL + LLM_API_KEY for any
// other OpenAI-compatible host.

import { claude } from "./claude.ts";

// extractJson lives in claude.ts; re-export so callers have one import.
export { extractJson } from "./claude.ts";

export type Provider =
  | "groq"
  | "gemini"
  | "openai"
  | "openrouter"
  | "together"
  | "anthropic";

interface Preset {
  base: string; // OpenAI-compatible base URL (we POST {base}/chat/completions)
  model: string; // sensible default, overridable with LLM_MODEL
  keyEnv: string; // env var holding this provider's key
  keysUrl: string; // where to get a key (shown in errors)
}

// OpenAI-compatible providers. Gemini exposes an OpenAI-compatible endpoint too,
// so one code path covers all of these.
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

const env = (k: string) => Deno.env.get(k);

/** Resolve the active provider: explicit LLM_PROVIDER, else infer from whichever key is set, else groq. */
export function provider(): Provider {
  const p = (env("LLM_PROVIDER") ?? "").toLowerCase().trim();
  if (p) return p as Provider;
  if (env("ANTHROPIC_API_KEY")) return "anthropic";
  if (env("GROQ_API_KEY")) return "groq";
  if (env("GEMINI_API_KEY")) return "gemini";
  if (env("OPENAI_API_KEY")) return "openai";
  if (env("OPENROUTER_API_KEY")) return "openrouter";
  if (env("TOGETHER_API_KEY")) return "together";
  return "groq";
}

/** Human-readable "provider · model" for logs and the test harness. */
export function providerLabel(): string {
  const p = provider();
  if (p === "anthropic") {
    return `anthropic · ${env("CLAUDE_MODEL") ?? "claude-sonnet-4-6"}`;
  }
  const preset = PRESETS[p];
  return `${p} · ${env("LLM_MODEL") ?? preset?.model ?? "?"}`;
}

export interface LlmOpts {
  system?: string;
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

/** Call the active LLM and return its text. Throws a clear, actionable error if no key is set. */
export async function llm(prompt: string, opts: LlmOpts = {}): Promise<string> {
  const p = provider();
  if (p === "anthropic") return claude(prompt, opts);

  const preset = PRESETS[p];
  if (!preset) {
    throw new Error(
      `Unknown LLM_PROVIDER "${p}". Use one of: ${Object.keys(PRESETS).join(", ")}, anthropic.`,
    );
  }

  const base = env("LLM_BASE_URL") ?? preset.base;
  const model = opts.model ?? env("LLM_MODEL") ?? preset.model;
  const apiKey = env("LLM_API_KEY") ?? env(preset.keyEnv);
  if (!apiKey) {
    throw new Error(
      `No API key for LLM provider "${p}". Set ${preset.keyEnv} (free key: ${preset.keysUrl}). ` +
        `Supabase: supabase secrets set ${preset.keyEnv}=...`,
    );
  }

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens ?? 2048,
      ...(opts.temperature !== undefined ? { temperature: opts.temperature } : {}),
      messages: [
        ...(opts.system ? [{ role: "system", content: opts.system }] : []),
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`${p} API ${res.status}: ${detail}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  return String(text).trim();
}
