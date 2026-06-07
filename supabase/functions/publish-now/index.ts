// POST /functions/v1/publish-now   (manual override from the dashboard)
// Publishes a single APPROVED post immediately instead of waiting for its slot.
//
// Body: { post_id }
// The approval gate still applies: the post must be status='scheduled'
// (i.e. a human approved it). Pending/draft posts are rejected — approve first.

import { handlePreflight, json } from "../_shared/cors.ts";
import { admin } from "../_shared/db.ts";
import { publishPost, type PostRow } from "../_shared/publish.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  try {
    const db = admin();
    const body = await req.json().catch(() => ({}));
    if (!body.post_id) return json({ error: "post_id is required." }, 400);

    const { data: post, error } = await db
      .from("posts")
      .select("id, content, account_id, status, publish_attempts")
      .eq("id", body.post_id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!post) return json({ error: "Post not found." }, 404);

    if (post.status === "posted") {
      return json({ error: "Already posted." }, 409);
    }
    if (post.status !== "scheduled") {
      return json(
        { error: "Post must be approved before it can be sent. Approve it first." },
        409,
      );
    }

    const result = await publishPost(post as PostRow);
    if (!result.ok) return json({ ok: false, error: result.error }, 502);
    return json({ ok: true, url: result.url });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
