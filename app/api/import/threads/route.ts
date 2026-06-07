import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * Import the connected user's OWN recent Threads posts so we can learn their
 * voice from them. Uses the configured Threads token — we only ever read the
 * owner's account, never anyone else's. Dormant until THREADS_USER_ID +
 * THREADS_ACCESS_TOKEN are set.
 */
export async function POST() {
  const userId = process.env.THREADS_USER_ID;
  const token = process.env.THREADS_ACCESS_TOKEN;
  if (!userId || !token) {
    return NextResponse.json(
      {
        error:
          "Threads isn't connected yet. Add THREADS_USER_ID + THREADS_ACCESS_TOKEN (your own account).",
      },
      { status: 400 }
    );
  }

  try {
    const url = new URL(`https://graph.threads.net/v1.0/${userId}/threads`);
    url.searchParams.set("fields", "text,media_type,timestamp");
    url.searchParams.set("limit", "25");
    url.searchParams.set("access_token", token);

    const r = await fetch(url.toString());
    const j = (await r.json()) as {
      data?: Array<{ text?: string }>;
      error?: { message?: string };
    };
    if (!r.ok) {
      return NextResponse.json(
        { error: j?.error?.message || "Threads import failed." },
        { status: r.status }
      );
    }

    const samples = (j.data || []).map((d) => (d.text || "").trim()).filter(Boolean);
    return NextResponse.json({ ok: true, samples });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Threads import failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
