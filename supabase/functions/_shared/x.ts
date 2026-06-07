// Publish to X (Twitter) via API v2.
//
// Token resolution order:
//   1. the per-account token passed in (accounts.x_access_token), then
//   2. the shared X_BEARER_TOKEN secret (Taylor's team key) as a fallback.
// Needs an OAuth 2.0 user-context token with tweet.write + users.read.

export interface PostedTweet {
  id: string;
  text: string;
  url: string;
}

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export function resolveXToken(accountToken?: string | null): string | null {
  return accountToken || Deno.env.get("X_BEARER_TOKEN") || null;
}

async function lookupUsername(token: string): Promise<string | undefined> {
  try {
    const r = await fetch("https://api.x.com/2/users/me", { headers: authHeaders(token) });
    if (!r.ok) return undefined;
    const j = await r.json();
    return j?.data?.username;
  } catch {
    return undefined;
  }
}

/**
 * Post a single tweet or a thread (array of texts posted as a reply chain).
 * Returns every created tweet. Throws on the first API rejection.
 */
export async function postToX(
  token: string,
  texts: string[],
): Promise<PostedTweet[]> {
  const username = await lookupUsername(token);
  const results: PostedTweet[] = [];
  let replyToId: string | undefined;

  for (const text of texts) {
    const payload: Record<string, unknown> = { text };
    if (replyToId) payload.reply = { in_reply_to_tweet_id: replyToId };

    const r = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(payload),
    });
    const data = await r.json();
    if (!r.ok) {
      throw new Error(
        data?.detail || data?.title || `X API rejected the post (${r.status}).`,
      );
    }

    const id: string = data?.data?.id;
    replyToId = id;
    results.push({
      id,
      text,
      url: username
        ? `https://x.com/${username}/status/${id}`
        : `https://x.com/i/web/status/${id}`,
    });
  }

  return results;
}
