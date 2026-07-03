// Landing-page "try it" preview helpers.
// The preview ECHOES the voice the visitor types in — gen-z in, gen-z out;
// formal in, formal out. Real generation happens server-side in /api/preview
// when an LLM key is configured; this module provides the always-on-topic
// fallback (used when no key / rate-limited / slow) which mirrors the visitor's
// register with a light heuristic so the demo still lands.

type Register = "genz" | "formal" | "default";

// Slang / emoji that scream gen-z.
const GENZ =
  /\b(fr|frfr|ngl|lowkey|highkey|no ?cap|bestie|rizz|mid|delulu|slay|based|bussin|ate|cooked|cook|yap|deadass|glaze|goated|sus|bet|vibe|vibes)\b|💀|😭|🫠|🔥|✨|🥀/i;
// Markers of a polished / LinkedIn / boomer register.
const FORMAL =
  /\b(thoughts|folks|humbled|blessed|journey|excited to|pleased to|grateful|colleagues|kindly|regards|furthermore|leverage|synergy|takeaway|lesson)\b/i;

function detectRegister(idea: string): Register {
  const s = idea.trim();
  if (GENZ.test(s)) return "genz";
  // Reads like proper prose: capitalized start, ends on punctuation, a few words.
  const looksFormal =
    FORMAL.test(s) ||
    (/^[A-Z]/.test(s) && /[.!?]$/.test(s) && s.split(/\s+/).length > 5);
  return looksFormal ? "formal" : "default";
}

const PUNCHES: Record<Register, string[]> = {
  genz: [
    "just cook. the plan is delulu, shipping is the rizz fr.",
    "planning is so mid ngl. build the ugly version and fix it live 💀",
    "nobody's watching the first 100 posts anyway. yap into the void, one hits.",
  ],
  formal: [
    "Don't wait for perfect. Ship your work and refine it along the way.",
    "Execution beats planning every time. Start before you feel ready.",
    "The people you admire didn't wait to be discovered — they out-shipped the wait.",
  ],
  default: [
    "everyone waits for permission. the ones who win just ship and let the plan catch up.",
    "the hard part isn't the idea. it's showing up on the days nobody's watching.",
    "no funding, no team, no permission needed. start now, fix it in public.",
  ],
};

// Deterministic pick so the same idea always yields the same draft (no flicker,
// no Math.random — unavailable in some runtimes here anyway).
function pick<T>(arr: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

/**
 * A coherent, on-topic draft built from the visitor's own idea — leading with
 * their exact words (never off-topic) and closing with a line in the same
 * register they typed in.
 */
export function previewFallback(idea: string): string {
  const hook = idea.trim().replace(/\s+/g, " ");
  const punch = pick(PUNCHES[detectRegister(hook)], hook.toLowerCase());
  return `${hook}\n\n${punch}`;
}
