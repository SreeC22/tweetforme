// Landing-page "try it" preview helpers.
// Real generation happens server-side in /api/preview when an LLM key is
// configured. This module provides the always-on-topic fallback so the widget
// never shows a draft about something the visitor didn't type (the old bug:
// a fixed "overnight success" draft regardless of the idea).

const PUNCHES = [
  "everyone waits for permission. the ones who win just ship and let the plan catch up.",
  "that's not the hard part. the hard part is showing up on the days nobody's watching.",
  "most people will nod and scroll on. be the one who ships the ugly v1 today.",
  "no funding, no team, no permission needed. start now, fix it in public.",
  "the plan reveals itself once something's live. build first, theorize later.",
  "you don't need a bigger audience. you need one person who cares enough to pay.",
];

// Deterministic pick so the same idea always yields the same draft (no flicker,
// no Math.random — which is unavailable in some runtimes here anyway).
function pick<T>(arr: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return arr[h % arr.length];
}

/**
 * A coherent, on-topic draft built from the visitor's own idea, in the sample
 * indie-hacker voice. Leads with their exact words so it can never be off-topic.
 */
export function previewFallback(idea: string): string {
  const hook = idea.trim().replace(/\s+/g, " ");
  const punch = pick(PUNCHES, hook.toLowerCase());
  return `${hook}\n\n${punch}`;
}
