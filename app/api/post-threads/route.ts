import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Auto-post to Meta Threads via the Threads Graph API.
 * Requires THREADS_USER_ID + THREADS_ACCESS_TOKEN (long-lived user token).
 * Two-step flow: create a media container, then publish it.
 */
export async function POST(req: NextRequest) {
  const userId = process.env.THREADS_USER_ID;
  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!userId || !token) {
    return NextResponse.json(
      {
        error:
          "Threads is not connected. Add THREADS_USER_ID + THREADS_ACCESS_TOKEN to .env.local.",
        connect: "https://developers.facebook.com/docs/threads/posts",
      },
      { status: 400 }
    );
  }

  try {
    const { text } = (await req.json()) as { text?: string };
    if (!text) {
      return NextResponse.json({ error: "Nothing to post." }, { status: 400 });
    }

    // 1) Create container
    const createUrl = new URL(`https://graph.threads.net/v1.0/${userId}/threads`);
    createUrl.searchParams.set("media_type", "TEXT");
    createUrl.searchParams.set("text", text);
    createUrl.searchParams.set("access_token", token);

    const c = await fetch(createUrl.toString(), { method: "POST" });
    const cj = await c.json();
    if (!c.ok || !cj?.id) {
      return NextResponse.json(
        { error: cj?.error?.message || "Failed to create Threads container.", raw: cj },
        { status: c.status }
      );
    }

    // 2) Publish container
    const pubUrl = new URL(`https://graph.threads.net/v1.0/${userId}/threads_publish`);
    pubUrl.searchParams.set("creation_id", cj.id);
    pubUrl.searchParams.set("access_token", token);

    const p = await fetch(pubUrl.toString(), { method: "POST" });
    const pj = await p.json();
    if (!p.ok || !pj?.id) {
      return NextResponse.json(
        { error: pj?.error?.message || "Failed to publish Threads post.", raw: pj },
        { status: p.status }
      );
    }

    // Optional: fetch permalink
    let url: string | undefined;
    try {
      const meta = await fetch(
        `https://graph.threads.net/v1.0/${pj.id}?fields=permalink&access_token=${token}`
      );
      const mj = await meta.json();
      url = mj?.permalink;
    } catch {
      // permalink is best-effort
    }

    return NextResponse.json({ ok: true, id: pj.id, url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
