// Prove the REAL voice engine end to end — no Supabase, no deploy, no mock data.
// It learns a voice from sample posts and writes fresh tweets in that voice,
// using the exact prompts (_shared/prompts.ts) and LLM client (_shared/llm.ts)
// the deployed functions use.
//
// ── Get a FREE key (60s, no card) ───────────────────────────────────────────
//   Groq:    https://console.groq.com/keys     → export GROQ_API_KEY=...
//   Gemini:  https://aistudio.google.com/apikey → export GEMINI_API_KEY=...
//
// ── Run it ──────────────────────────────────────────────────────────────────
//   Deno:  deno run -A scripts/try-pipeline.ts
//   Node:  node --experimental-strip-types scripts/try-pipeline.ts   (Node 22+)
//
// ── Options ───────────────────────────────────────────────────────────────--
//   --handle levelsio        label for the voice
//   --count 5                how many tweets to generate
//   --material "a\n\nb"      your own brand material (blank-line separated)
//   --file posts.txt         ...or read it from a file
//   LLM_PROVIDER=groq|gemini|anthropic   LLM_MODEL=...   pick provider/model

// Cross-runtime shim: let the Deno-flavoured shared modules run under Node too.
const G = globalThis as unknown as {
  Deno?: { env: { get(k: string): string | undefined }; args: string[] };
  process?: { argv: string[]; env: Record<string, string | undefined> };
};
if (typeof G.Deno === "undefined") {
  G.Deno = {
    env: { get: (k: string) => G.process!.env[k] },
    args: G.process!.argv.slice(2),
  };
}
const ARGS: string[] = G.Deno!.args;

function opt(name: string, fallback = ""): string {
  const i = ARGS.indexOf(`--${name}`);
  return i >= 0 && ARGS[i + 1] ? ARGS[i + 1] : fallback;
}

// A generic builder/indie-hacker voice — replace with --material / --file.
const SAMPLE = [
  "shipped a new feature today. took 3 hours. would have taken a 'real' company 3 months",
  "most of my best products were built in a weekend. overthinking is the enemy",
  "just hit $50k MRR. no team, no funding, no meetings. just me and a laptop",
  "people ask what stack I use. it does not matter. ship with whatever you know",
  "revenue solves everything. get to revenue as fast as you can and the rest follows",
  "you do not need permission to start. you need a domain and a free afternoon",
].join("\n\n");

async function readFileText(path: string): Promise<string> {
  // Deno has Deno.readTextFile; Node needs fs. Try Deno first.
  const d = G.Deno as unknown as { readTextFile?: (p: string) => Promise<string> };
  if (d.readTextFile) return await d.readTextFile(path);
  const fs = await import("node:fs/promises");
  return await fs.readFile(path, "utf8");
}

async function main() {
  const handle = (opt("handle", "creator")).replace(/^@/, "");
  const count = Number(opt("count", "5")) || 5;
  const file = opt("file");
  const material = file ? await readFileText(file) : opt("material", SAMPLE);

  // Import the real code AFTER the shim is in place.
  const { llm, extractJson, providerLabel } = await import(
    "../supabase/functions/_shared/llm.ts"
  );
  const {
    ANALYSIS_SYSTEM,
    buildAnalysisPrompt,
    buildGenerationSystem,
    buildGenerationPrompt,
  } = await import("../supabase/functions/_shared/prompts.ts");

  const samples = material.split(/\n\s*\n+/).map((s: string) => s.trim()).filter(Boolean);
  const block = samples.map((s: string, i: number) => `--- Post ${i + 1} ---\n${s}`).join("\n\n");

  console.log(`\nLLM:    ${providerLabel()}`);
  console.log(`Handle: @${handle}   Samples: ${samples.length}   Generating: ${count}\n`);

  // ── Stage 1: learn the voice ───────────────────────────────────────────────
  console.log("Learning voice…");
  const profileRaw = await llm(buildAnalysisPrompt(handle, block), {
    system: ANALYSIS_SYSTEM,
    maxTokens: 1500,
  });
  // deno-lint-ignore no-explicit-any
  const profile = extractJson<any>(profileRaw);

  console.log("\n===== VOICE PROFILE =====");
  console.log(`archetype:  ${profile.archetype}`);
  console.log(`summary:    ${profile.summary}`);
  console.log(`hooks:      ${(profile.hook_patterns ?? []).join(" | ")}`);
  console.log(`uses:       ${(profile.phrases_they_use ?? []).join(", ")}`);
  console.log(`never:      ${(profile.phrases_to_avoid ?? []).join(", ")}`);
  if (profile.tone_scores) {
    console.log(`tone:       ${Object.entries(profile.tone_scores).map(([k, v]) => `${k} ${v}`).join("  ")}`);
  }

  // ── Stage 2: write tweets in that voice ────────────────────────────────────
  console.log("\nGenerating tweets…");
  const tweetsRaw = await llm(
    buildGenerationPrompt({ handle, count, material, topics: profile.topics }),
    { system: buildGenerationSystem(profile, handle), maxTokens: 2600, temperature: 0.9 },
  );
  // deno-lint-ignore no-explicit-any
  const tweets = extractJson<any[]>(tweetsRaw);

  console.log(`\n===== ${tweets.length} TWEETS =====`);
  tweets.forEach((t, i) => {
    console.log(`\n${i + 1}. [${t.category ?? "—"}] ${t.title ?? ""}`);
    console.log(t.text);
    if (t.why_it_fits) console.log(`   ↳ ${t.why_it_fits}`);
  });
  console.log("\nDone. This is the same prompts.ts + llm.ts the deployed functions use.\n");
}

main().catch((e) => {
  console.error("\n✗ " + (e instanceof Error ? e.message : String(e)) + "\n");
  const d = G.Deno as unknown as { exit?: (c: number) => never };
  if (d.exit) d.exit(1); // Deno
  else if (G.process) (G.process as unknown as { exitCode: number }).exitCode = 1; // Node
});
