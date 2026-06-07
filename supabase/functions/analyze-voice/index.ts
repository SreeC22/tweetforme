// POST /functions/v1/analyze-voice
// Learns a creator's voice from sample posts and PERSISTS it to voice_profiles.
// Re-running adds a fresh profile row (history is kept); generation always uses
// the latest. This is the "persist + update brand voice" path.
//
// Body: { account_id?, handle?, samples?: string[], brand_material?: string }
// Returns: { ok, voice_profile }

import { handlePreflight, json } from "../_shared/cors.ts";
import { admin } from "../_shared/db.ts";
import { claude, extractJson } from "../_shared/claude.ts";
import { ANALYSIS_SYSTEM, buildAnalysisPrompt, type VoiceProfile } from "../_shared/prompts.ts";

/** Accept either an explicit samples[] or a brand_material blob split on blank lines. */
function toSamples(body: { samples?: string[]; brand_material?: string }): string[] {
  if (Array.isArray(body.samples) && body.samples.length) {
    return body.samples.map((s) => String(s).trim()).filter(Boolean);
  }
  const bm = (body.brand_material ?? "").trim();
  if (!bm) return [];
  return bm.split(/\n\s*\n+/).map((s) => s.trim()).filter(Boolean);
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  try {
    const db = admin();
    const body = await req.json().catch(() => ({}));

    const samples = toSamples(body);
    if (samples.length < 1) {
      return json({ error: "Provide brand_material or samples to learn the voice." }, 400);
    }

    const handle = String(body.handle ?? "creator").replace(/^@/, "");
    const block = samples.map((s, i) => `--- Post ${i + 1} ---\n${s}`).join("\n\n");

    const raw = await claude(buildAnalysisPrompt(handle, block), {
      system: ANALYSIS_SYSTEM,
      maxTokens: 1500,
    });
    const profile = extractJson<VoiceProfile>(raw);

    const { data, error } = await db
      .from("voice_profiles")
      .insert({
        account_id: body.account_id ?? null,
        handle,
        archetype: profile.archetype,
        summary: profile.summary,
        profile,
        samples,
        tweets_analyzed: samples.length,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    return json({ ok: true, voice_profile: data });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
