// POST /functions/v1/generate-tweets
// The generation half of the orchestration layer. Self-sufficient so BOTH the
// dashboard (first run) and pg_cron (daily top-up) can call it.
//
//   1. resolve the account (by id, or the current active one, or create it)
//   2. ensure a voice profile exists (analyze brand_material if not)
//   3. decide how many posts to make (explicit count, or gap-fill the schedule)
//   4. generate them in-voice and queue as status='pending' with scheduled_for
//
// Body: { account_id?, handle?, brand_material?, material?, count?, source? }
// Returns: { ok, generated, account_id, voice_profile_id, posts }

import { handlePreflight, json } from "../_shared/cors.ts";
import { admin, currentAccount, type Account } from "../_shared/db.ts";
import { claude, extractJson } from "../_shared/claude.ts";
import {
  ANALYSIS_SYSTEM,
  buildAnalysisPrompt,
  buildGenerationPrompt,
  buildGenerationSystem,
  type GeneratedTweet,
  type VoiceProfile,
} from "../_shared/prompts.ts";
import { makeSlots, nextSlots, type Period } from "../_shared/schedule.ts";

// deno-lint-ignore no-explicit-any
type DB = any;

async function ensureAccount(db: DB, body: Record<string, unknown>): Promise<Account> {
  if (body.account_id) {
    const { data } = await db.from("accounts").select("*").eq("id", body.account_id).maybeSingle();
    if (data) return data as Account;
  }
  const existing = await currentAccount();
  if (existing) return existing;

  const { data, error } = await db
    .from("accounts")
    .insert({
      handle: body.handle ? String(body.handle).replace(/^@/, "") : null,
      brand_material: body.brand_material ?? null,
      posts_per_period: Number(body.posts_per_period) || 5,
      period: ["day", "week", "month"].includes(body.period as string) ? body.period : "week",
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Account;
}

async function ensureVoiceProfile(
  db: DB,
  account: Account,
  body: Record<string, unknown>,
): Promise<{ id: string; profile: VoiceProfile; handle: string }> {
  const { data: existing } = await db
    .from("voice_profiles")
    .select("*")
    .eq("account_id", account.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      profile: existing.profile as VoiceProfile,
      handle: existing.handle ?? account.handle ?? "creator",
    };
  }

  // No profile yet — learn one from the brand material.
  const material = String(body.brand_material ?? account.brand_material ?? "").trim();
  const samples = material.split(/\n\s*\n+/).map((s) => s.trim()).filter(Boolean);
  if (!samples.length) {
    throw new Error("No voice profile yet and no brand_material to learn from.");
  }

  const handle = String(account.handle ?? body.handle ?? "creator").replace(/^@/, "");
  const block = samples.map((s, i) => `--- Post ${i + 1} ---\n${s}`).join("\n\n");
  const raw = await claude(buildAnalysisPrompt(handle, block), {
    system: ANALYSIS_SYSTEM,
    maxTokens: 1500,
  });
  const profile = extractJson<VoiceProfile>(raw);

  const { data, error } = await db
    .from("voice_profiles")
    .insert({
      account_id: account.id,
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
  return { id: data.id, profile, handle };
}

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  try {
    const db = admin();
    const body = await req.json().catch(() => ({}));

    const account = await ensureAccount(db, body);
    const voice = await ensureVoiceProfile(db, account, body);
    const period = account.period as Period;

    // How many to make: explicit count wins, else gap-fill the schedule.
    // "Queue" = anything still awaiting review or approved-but-not-yet-posted.
    const { count: queued } = await db
      .from("posts")
      .select("id", { count: "exact", head: true })
      .eq("account_id", account.id)
      .in("status", ["pending", "scheduled"]);

    const explicit = Number(body.count) || 0;
    const gapSlots = nextSlots({
      postsPerPeriod: account.posts_per_period,
      period,
      alreadyQueued: queued ?? 0,
    });
    const count = explicit > 0 ? explicit : gapSlots.length;

    if (count <= 0) {
      return json({ ok: true, generated: 0, posts: [], reason: "queue already full" });
    }

    const slots = explicit > 0
      ? makeSlots(count, account.posts_per_period, period)
      : gapSlots;

    // Generate.
    const sys = buildGenerationSystem(voice.profile, voice.handle);
    const prompt = buildGenerationPrompt({
      handle: voice.handle,
      count,
      material: (body.material as string) ?? account.brand_material,
      topics: voice.profile.topics,
    });
    const raw = await claude(prompt, { system: sys, maxTokens: 2600 });
    const tweets = extractJson<GeneratedTweet[]>(raw);

    const rows = tweets.slice(0, count).map((t, i) => ({
      account_id: account.id,
      voice_profile_id: voice.id,
      title: (t.title ?? t.text ?? "").slice(0, 80),
      content: t.text,
      platform: "Twitter / X",
      status: "pending",
      scheduled_for: (slots[i] ?? slots[slots.length - 1]).toISOString(),
      category: t.category ?? null,
      hook_type: t.hook_type ?? null,
      why_it_fits: t.why_it_fits ?? null,
    }));

    const { data, error } = await db.from("posts").insert(rows).select();
    if (error) throw new Error(error.message);

    return json({
      ok: true,
      generated: data.length,
      account_id: account.id,
      voice_profile_id: voice.id,
      posts: data,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
