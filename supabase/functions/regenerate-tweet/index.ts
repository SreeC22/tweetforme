// POST /functions/v1/regenerate-tweet
// Rewrites a single post in the creator's voice — optionally steered by reviewer
// feedback — and sends it back to 'pending' for re-review (even if it had been
// approved, since the text changed).
//
// Body: { post_id, note? }
// Returns: { ok, post }

import { handlePreflight, json } from "../_shared/cors.ts";
import { admin } from "../_shared/db.ts";
import { llm, extractJson } from "../_shared/llm.ts";
import { buildGenerationSystem, type GeneratedTweet, type VoiceProfile } from "../_shared/prompts.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  try {
    const db = admin();
    const body = await req.json().catch(() => ({}));
    if (!body.post_id) return json({ error: "post_id is required." }, 400);

    const { data: post, error } = await db
      .from("posts")
      .select("*")
      .eq("id", body.post_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) return json({ error: "Post not found." }, 404);

    // Find the voice profile to write with.
    let vp = null;
    if (post.voice_profile_id) {
      const { data } = await db.from("voice_profiles").select("*").eq("id", post.voice_profile_id).maybeSingle();
      vp = data;
    }
    if (!vp && post.account_id) {
      const { data } = await db
        .from("voice_profiles")
        .select("*")
        .eq("account_id", post.account_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      vp = data;
    }
    if (!vp) return json({ error: "No voice profile available to regenerate from." }, 400);

    const profile = vp.profile as VoiceProfile;
    const handle = vp.handle ?? "creator";
    const note = String(body.note ?? "").trim();

    const prompt = `Rewrite this post so it still sounds exactly like @${handle}, but is a fresh take — different opening and angle from the original.

ORIGINAL:
${post.content}
${note ? `\nREVIEWER FEEDBACK (address this): ${note}\n` : ""}
Return a JSON object:
{ "text": "...", "title": "3-6 word internal title", "category": "...", "hook_type": "...", "why_it_fits": "..." }
Return only valid JSON. No markdown fences.`;

    const raw = await llm(prompt, {
      system: buildGenerationSystem(profile, handle),
      maxTokens: 800,
    });
    const t = extractJson<GeneratedTweet>(raw);

    const { data: updated, error: upErr } = await db
      .from("posts")
      .update({
        content: t.text,
        title: (t.title ?? t.text ?? "").slice(0, 80),
        category: t.category ?? post.category,
        hook_type: t.hook_type ?? null,
        why_it_fits: t.why_it_fits ?? null,
        // text changed → back to review, drop the old approval
        status: "pending",
        approved_at: null,
        hold: false,
        error: null,
      })
      .eq("id", post.id)
      .select()
      .single();
    if (upErr) throw new Error(upErr.message);

    return json({ ok: true, post: updated });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
