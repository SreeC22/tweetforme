import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Auto-post to X (Twitter) via API v2.
 * Requires an OAuth 2.0 user-context access token with tweet.write + users.read.
 * Set X_BEARER_TOKEN in .env.local.
 *
 * Accepts either { text } for a single tweet or { thread: string[] } for a
 * reply-chain. Returns the URL(s) of the published tweet(s).
 */
export async function POST(req: NextRequest) {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) {
    return NextResponse.json(
      {
        error:
          "X is not connected. Add X_BEARER_TOKEN to .env.local (OAuth 2.0 user token with tweet.write).",
        connect: "https://developer.x.com/en/portal/dashboard",
      },
      { status: 400 }
    );
  }

  try {
    const body = (await req.json()) as { text?: string; thread?: string[] };
    const tweets = body.thread?.length ? body.thread : body.text ? [body.text] : [];
    if (!tweets.length) {
      return NextResponse.json({ error: "Nothing to post." }, { status: 400 });
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };

    const results: { id: string; text: string; url: string }[] = [];
    let replyToId: string | undefined;
    let username: string | undefined;

    // Resolve username once so we can build URLs
    try {
      const me = await fetch("https://api.x.com/2/users/me", { headers });
      if (me.ok) {
        const j = await me.json();
        username = j?.data?.username;
      }
    } catch {
      // optional
    }

    for (const text of tweets) {
      const payload: Record<string, unknown> = { text };
      if (replyToId) payload.reply = { in_reply_to_tweet_id: replyToId };

      const r = await fetch("https://api.x.com/2/tweets", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (!r.ok) {
        return NextResponse.json(
          { error: data?.detail || data?.title || "X API rejected the post.", raw: data },
          { status: r.status }
        );
      }
      const id: string = data?.data?.id;
      replyToId = id;
      results.push({
        id,
        text,
        url: username ? `https://x.com/${username}/status/${id}` : `https://x.com/i/web/status/${id}`,
      });
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
