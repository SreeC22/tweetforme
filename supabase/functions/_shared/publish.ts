// Shared publish path. The ONLY place a post becomes a live tweet — both the
// cron (publish-due) and the manual override (publish-now) go through here, so
// the approval gate and bookkeeping live in one spot.

import { admin } from "./db.ts";
import { postToX, resolveXToken } from "./x.ts";

const MAX_ATTEMPTS = 3;

export interface PostRow {
  id: string;
  content: string;
  account_id: string | null;
  status: string;
  publish_attempts: number;
}

export async function publishPost(post: PostRow): Promise<{ ok: boolean; url?: string; error?: string }> {
  const db = admin();
  const attempts = (post.publish_attempts ?? 0) + 1;

  // Resolve the X token: per-account first, shared team token as fallback.
  let accountToken: string | null = null;
  if (post.account_id) {
    const { data: acct } = await db
      .from("accounts")
      .select("x_access_token")
      .eq("id", post.account_id)
      .maybeSingle();
    accountToken = acct?.x_access_token ?? null;
  }
  const token = resolveXToken(accountToken);

  if (!token) {
    await db.from("posts").update({
      status: "failed",
      error: "No X token configured (set accounts.x_access_token or the X_BEARER_TOKEN secret).",
      publish_attempts: attempts,
    }).eq("id", post.id);
    return { ok: false, error: "No X token configured." };
  }

  try {
    const posted = await postToX(token, [post.content]);
    const first = posted[0];
    await db.from("posts").update({
      status: "posted",
      posted_at: new Date().toISOString(),
      x_tweet_id: first.id,
      x_url: first.url,
      error: null,
      publish_attempts: attempts,
    }).eq("id", post.id);
    return { ok: true, url: first.url };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Keep retrying (stays 'scheduled') until we hit the attempt ceiling.
    await db.from("posts").update({
      status: attempts >= MAX_ATTEMPTS ? "failed" : "scheduled",
      error: msg,
      publish_attempts: attempts,
    }).eq("id", post.id);
    return { ok: false, error: msg };
  }
}
