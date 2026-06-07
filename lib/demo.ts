// Demo mode — a bulletproof fallback for screen recordings.
// Add ?demo=1 to /train or /generate and the flow uses seeded voice + drafts
// (instant, deterministic, no API call), so a recording can never break on a
// slow or rate-limited call. Real mode (no flag) is unchanged.

import type { Draft, VoiceProfile } from "@/lib/types";

export function isDemo(): boolean {
  if (typeof window === "undefined") return false;
  const q = new URLSearchParams(window.location.search);
  return q.get("demo") === "1" || q.get("autoplay") === "1";
}

// Autoplay = the self-running animated demo (types inputs, auto-advances across
// pages). Implies demo seeding.
export function isAutoplay(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("autoplay") === "1";
}

export const DEMO_SAMPLES = [
  "shipped a feature in 3 hours that a \"real\" company would take 3 months to ship. small teams win on speed, not headcount.",
  "nobody cares about your tech stack. they care if the thing works. use whatever lets you ship today.",
  "hit $30k MRR this month. no funding, no team, no standups. just me, a laptop, and customers who pay.",
  "most of my best products were built in a single weekend. the ideas i \"planned\" for months never shipped.",
  "your first version should embarrass you. if you're proud of v1, you waited too long to launch.",
  "revenue is the only validation that matters. likes don't pay rent. get one person to pay you $1.",
].join("\n\n");

export const DEMO_PROFILE: VoiceProfile = {
  summary:
    "Punchy indie-hacker voice. Short, declarative sentences, lowercase, zero fluff. Contrarian about startup orthodoxy; obsessed with shipping fast and getting to revenue.",
  tone: ["direct", "confident", "contrarian", "casual"],
  vocabulary: ["ship", "MRR", "weekend", "build", "revenue", "no meetings", "v1"],
  structures: [
    "one bold claim + a one-line reason",
    "X, not Y reframe",
    "do this. not that.",
  ],
  dos: [
    "lead with the strong claim",
    "use a concrete number as proof",
    "keep it to one or two sentences",
  ],
  donts: ["corporate buzzwords", "hashtags", "hedging", "humblebrags"],
  signature_moves: [
    "lowercase everything",
    "drop a number for proof",
    "end on a punch",
  ],
  example_openings: [
    "shipped a thing today.",
    "nobody cares about…",
    "most of my best work…",
  ],
  samples: DEMO_SAMPLES.split(/\n\s*\n+/),
  createdAt: new Date().toISOString(),
};

export const DEMO_DRAFTS: Draft[] = [
  {
    platform: "x",
    text: "the \"overnight success\" you're jealous of has been shipping for six years. you just started watching last week.",
  },
  {
    platform: "x",
    text: "overnight success is survivorship bias with good lighting. the 1,000 boring days of shipping don't trend.",
  },
  {
    platform: "x",
    note: "thread variant",
    text: "everyone wants the overnight success. nobody wants the overnight part: 1,000 quiet days of shipping to no one.",
    thread: [
      "everyone wants the overnight success. nobody wants the overnight part: 1,000 quiet days of shipping to no one.",
      "year 1: nobody cares. year 2: a few people care. year 3: \"wow, you blew up overnight.\"",
      "the work never changed. the audience just showed up late. keep shipping.",
    ],
  },
  {
    platform: "threads",
    text: "overnight success is just compounding you couldn't see yet.\n\nshow up on the boring days. one of them becomes the story everyone retells.",
  },
  {
    platform: "linkedin",
    text: "Everyone loves an overnight success story.\n\nNobody mentions the 1,000 days before it — shipping with no audience, launches nobody noticed, weekends spent building instead of posting about building.\n\nThe \"overnight\" part is just the day the rest of us started paying attention. The work was already done.\n\nIf you're in the quiet part right now: that's not failure. That's the part the story leaves out.",
  },
  {
    platform: "linkedin",
    text: "I used to think I'd missed the window.\n\nThen I realized the people I admired didn't catch a window — they just kept shipping until one of a thousand attempts looked like luck from the outside.\n\nStop waiting to be discovered. Out-ship the wait.",
  },
];

// A visibly more casual / punchier set — returned on regenerate (and after a
// "too formal" 👎) so the demo shows the output actually changing & adapting.
export const DEMO_DRAFTS_ADAPTED: Draft[] = [
  {
    platform: "x",
    text: "nobody \"blew up overnight.\" they just shipped for six years while you weren't watching.",
  },
  {
    platform: "x",
    text: "overnight success = 1,000 boring days nobody filmed. that's the whole trick.",
  },
  {
    platform: "x",
    note: "thread variant",
    text: "everyone wants overnight success. nobody wants the 1,000 days of shipping to crickets first.",
    thread: [
      "everyone wants overnight success. nobody wants the 1,000 days of shipping to crickets first.",
      "yr 1: silence. yr 2: a trickle. yr 3: \"wow, overnight!\"",
      "same work. late audience. keep going.",
    ],
  },
  {
    platform: "threads",
    text: "overnight success is just compounding you couldn't see yet.\n\nshow up on the boring days. one of them becomes the story.",
  },
  {
    platform: "linkedin",
    text: "there's no such thing as overnight success.\n\njust 1,000 quiet days nobody saw — the flopped launches, the weekends spent building instead of posting about it.\n\nthe \"overnight\" is just the day people started watching. keep shipping.",
  },
  {
    platform: "linkedin",
    text: "thought i'd missed my shot.\n\nturns out nobody catches a \"window\" — they just out-ship the wait until one try looks like luck.\n\nstop waiting to be discovered.",
  },
];
