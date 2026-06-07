// ============================================================================
// THE VOICE ENGINE — how the brand voice is learned and how tweets are written.
// ----------------------------------------------------------------------------
// This file is the single source of truth for "how voice and tweets are
// generated". Two stages:
//
//   1. analyzeVoice  — read a creator's sample posts → a structured Voice Profile
//                      (archetype, hooks, phrases, tone scores, what performs).
//   2. generate      — given that profile + a topic/material → N tweets that
//                      sound like the creator, with the AI tells stripped out.
//
// Edit the prompts here to change quality/behaviour everywhere at once.
// ============================================================================

// ── Stage 1: VOICE ANALYSIS ─────────────────────────────────────────────────

export const ANALYSIS_SYSTEM =
  `You are an expert at analyzing writing style and social media voice.
Study a creator's posts and extract the precise patterns that make their voice
unique. Be specific — vague descriptions produce generic output. Your analysis
directly controls how an AI ghostwriter will write for this person.`;

export interface VoiceProfile {
  archetype: string;
  summary: string;
  hook_patterns: string[];
  phrases_they_use: string[];
  phrases_to_avoid: string[];
  topics: string[];
  tone_scores: {
    formality: number;
    humor: number;
    vulnerability: number;
    technical_depth: number;
    contrarianism: number;
  };
  tweet_structures: string[];
  what_performs_best: string;
}

export function buildAnalysisPrompt(handle: string, sampleBlock: string): string {
  return `Study these posts from @${handle} and build their voice profile.

${sampleBlock}

Return a JSON object with exactly these fields:

{
  "archetype": "one short label e.g. 'Dry Founder', 'Builder Poet', 'Tech Educator'",
  "summary": "3-4 sentences describing their voice precisely: sentence structure they prefer, humor style, topics they gravitate to, how they open posts. Specific enough that an AI cannot default to generic content.",
  "hook_patterns": ["3 specific ways they open posts, each with a brief example"],
  "phrases_they_use": ["5-8 actual phrases, words, or constructions they repeat"],
  "phrases_to_avoid": ["5 phrases that would sound unlike them — corporate speak, AI tells, etc."],
  "topics": ["6-8 topics they write about most"],
  "tone_scores": {
    "formality": 0,
    "humor": 0,
    "vulnerability": 0,
    "technical_depth": 0,
    "contrarianism": 0
  },
  "tweet_structures": ["3 structural patterns e.g. 'One bold claim. Short follow-up. Emoji.'"],
  "what_performs_best": "one paragraph on what their highest-engagement posts have in common"
}

tone_scores are 0-100. Return only valid JSON. No markdown fences.`;
}

// ── Stage 2: GENERATION ─────────────────────────────────────────────────────

/** System prompt assembled from the learned voice profile. */
export function buildGenerationSystem(p: VoiceProfile, handle: string): string {
  const list = (xs?: string[]) => (xs && xs.length ? xs : ["(none captured)"]);
  return `You are a ghostwriter for @${handle}. Write exactly like them.

WHO THEY ARE:
${p.summary}

HOW THEY OPEN POSTS:
${list(p.hook_patterns).map((h) => `- ${h}`).join("\n")}

PHRASES THEY USE: ${list(p.phrases_they_use).join(", ")}

NEVER WRITE: ${list(p.phrases_to_avoid).join(", ")}

THEIR POST STRUCTURES:
${list(p.tweet_structures).map((s) => `- ${s}`).join("\n")}

WHAT PERFORMS BEST FOR THEM:
${p.what_performs_best ?? ""}

RULES:
- Stay under 270 characters unless writing a thread opener (ends with ↓ or 🧵).
- First person only.
- Match their energy exactly — not more polished, not more casual.
- Mirror their punctuation habits, capitalization style, and emoji density.
- Never use em dashes.
- Never start with "I think", "Hot take:", "In today's world", or "Excited to share".
- Do NOT use hashtags or emoji unless their voice profile clearly uses them.
- Never sound like a LinkedIn post.`;
}

export interface GeneratedTweet {
  text: string;
  title?: string;
  category?: string;
  hook_type?: string;
  why_it_fits?: string;
}

export function buildGenerationPrompt(opts: {
  handle: string;
  count: number;
  material?: string | null;
  topics?: string[];
  exampleBlock?: string;
}): string {
  const { handle, count, material, topics, exampleBlock } = opts;

  const materialSection = material?.trim()
    ? `Use this as source material / inspiration:\n${material.trim()}`
    : `No specific material — generate from their usual topics and voice.`;

  const topicsLine = topics?.length
    ? `Topics to cover across the batch: ${topics.join(", ")}\n\n`
    : "";

  const examples = exampleBlock?.trim()
    ? `Examples of their writing (for tone reference):\n${exampleBlock.trim()}\n\n`
    : "";

  return `Generate ${count} posts for @${handle}.

${topicsLine}${materialSection}

${examples}Return a JSON array:
[
  {
    "text": "the post text",
    "title": "a 3-6 word internal title for the dashboard",
    "category": "tech | crypto | writing | humor | personal | science | fandom",
    "hook_type": "what makes the opening work",
    "why_it_fits": "one sentence on why this sounds like them"
  }
]

Vary hook styles and structures across the batch. Include at least one question.
Return only valid JSON. No markdown fences.`;
}

// ── Feedback loop: tighten the "never write" list from rejections ────────────

export function buildFeedbackPrompt(
  handle: string,
  rejectionSummary: string,
  currentAvoid: string[],
): string {
  return `A ghostwriter has been generating posts for @${handle}.
The user rejected posts for these reasons (most frequent first):

${rejectionSummary}

Their current NEVER WRITE list is:
${currentAvoid.join(", ")}

Update the NEVER WRITE list to incorporate these rejections. Add specific
patterns, not vague rules. Return only the updated list as a JSON array of strings.`;
}
