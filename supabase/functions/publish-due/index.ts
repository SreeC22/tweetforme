// POST /functions/v1/publish-due   (called every minute by pg_cron)
// Auto-publishes APPROVED posts whose scheduled time has arrived.
//
// The approval gate: only status='scheduled' rows are ever considered, and
// hold=true pauses a post without losing its approval. Nothing that hasn't been
// approved can ever be sent.

import { handlePreflight, json } from "../_shared/cors.ts";
import { admin } from "../_shared/db.ts";
import { publishPost, type PostRow } from "../_shared/publish.ts";

const BATCH = 10;

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  try {
    const db = admin();
    const nowIso = new Date().toISOString();

    const { data: due, error } = await db
      .from("posts")
      .select("id, content, account_id, status, publish_attempts")
      .eq("status", "scheduled")
      .eq("hold", false)
      .lte("scheduled_for", nowIso)
      .order("scheduled_for", { ascending: true })
      .limit(BATCH);
    if (error) throw new Error(error.message);

    const results = [];
    for (const post of (due ?? []) as PostRow[]) {
      const r = await publishPost(post);
      results.push({ id: post.id, ...r });
    }

    return json({
      ok: true,
      checked_at: nowIso,
      published: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
