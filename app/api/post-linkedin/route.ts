import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Auto-post to LinkedIn via the UGC Posts API.
 * Needs an OAuth token with the `w_member_social` scope and the author's member
 * URN (looks like "urn:li:person:abc123"). Dormant until both are set.
 */
export async function POST(req: NextRequest) {
  const token = process.env.LINKEDIN_ACCESS_TOKEN;
  const author = process.env.LINKEDIN_AUTHOR_URN;
  if (!token || !author) {
    return NextResponse.json(
      {
        error:
          "LinkedIn is not connected. Add LINKEDIN_ACCESS_TOKEN + LINKEDIN_AUTHOR_URN (urn:li:person:…).",
        connect: "https://learn.microsoft.com/linkedin/marketing/integrations/community-management/shares/ugc-post-api",
      },
      { status: 400 }
    );
  }

  try {
    const { text } = (await req.json()) as { text?: string };
    if (!text) {
      return NextResponse.json({ error: "Nothing to post." }, { status: 400 });
    }

    const r = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      return NextResponse.json(
        { error: j?.message || "Failed to publish to LinkedIn.", raw: j },
        { status: r.status }
      );
    }

    const id: string | undefined = j?.id || r.headers.get("x-restli-id") || undefined;
    const url = id ? `https://www.linkedin.com/feed/update/${id}` : undefined;
    return NextResponse.json({ ok: true, id, url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
