import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

/**
 * Waitlist capture.
 * Storage strategy (in priority order):
 *  1. If WAITLIST_WEBHOOK_URL is set, POST {email, source, at} to it.
 *     Use a Zapier / Make / Slack-incoming-webhook / Discord URL — done.
 *  2. Always also append to a local JSON file at /tmp/tweetforme-waitlist.json
 *     so local dev gives you a file to look at.
 *
 * For a production deploy, point WAITLIST_WEBHOOK_URL at a real sink.
 */

const FILE = path.join("/tmp", "tweetforme-waitlist.json");

type Entry = { email: string; source?: string; at: string };

async function readFile(): Promise<Entry[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as Entry[];
  } catch {
    return [];
  }
}

async function writeFile(entries: Entry[]) {
  try {
    await fs.writeFile(FILE, JSON.stringify(entries, null, 2));
  } catch {
    /* /tmp may be read-only in some serverless edges; ignore */
  }
}

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; source?: string };
    const email = (body.email || "").trim().toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: "That email doesn't look right." }, { status: 400 });
    }

    const entry: Entry = {
      email,
      source: body.source || "landing",
      at: new Date().toISOString(),
    };

    // Best-effort webhook
    const webhook = process.env.WAITLIST_WEBHOOK_URL;
    if (webhook) {
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `New tweetforme waitlist signup: ${email}`,
            ...entry,
          }),
        });
      } catch {
        /* swallow — never break the signup flow */
      }
    }

    // Best-effort file store
    const entries = await readFile();
    // de-dupe
    const already = entries.find((e) => e.email === email);
    if (!already) entries.push(entry);
    await writeFile(entries);

    const position = entries.findIndex((e) => e.email === email) + 1;
    const total = entries.length;
    return NextResponse.json({ ok: true, position: position || total, total });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const entries = await readFile();
  return NextResponse.json({ total: entries.length });
}
