import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { getSupabase, isSupabaseConfigured } from "@/lib/server/supabase";

export const runtime = "nodejs";

/**
 * Waitlist capture.
 *
 * Storage priority:
 *   1. Supabase (if SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set) — production sink.
 *   2. /tmp JSON file — dev-only fallback so the app works without any creds.
 *
 * Optional side-effects (always fire if configured, never block the response):
 *   - WAITLIST_WEBHOOK_URL: POSTs every signup so you can route it to Slack/Discord/Zapier.
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

async function fireWebhook(entry: Entry) {
  const webhook = process.env.WAITLIST_WEBHOOK_URL;
  if (!webhook) return;
  try {
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: `New tweetforme waitlist signup: ${entry.email}`,
        ...entry,
      }),
    });
  } catch {
    /* never break signup on a webhook hiccup */
  }
}

async function saveToSupabase(email: string, source: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not configured");

  // Upsert so a duplicate email doesn't 500 — returns the existing row instead.
  const { data: row, error: upsertErr } = await supabase
    .from("waitlist")
    .upsert(
      { email, source },
      { onConflict: "email", ignoreDuplicates: false },
    )
    .select("id, created_at")
    .single();

  if (upsertErr || !row) {
    throw new Error(upsertErr?.message || "Failed to save email");
  }

  // Position = number of rows created on or before this one (1-indexed).
  const { count: positionCount } = await supabase
    .from("waitlist")
    .select("id", { count: "exact", head: true })
    .lte("created_at", row.created_at);

  const { count: totalCount } = await supabase
    .from("waitlist")
    .select("id", { count: "exact", head: true });

  return {
    position: positionCount ?? 1,
    total: totalCount ?? 1,
  };
}

async function saveToFile(entry: Entry) {
  const entries = await readFile();
  const already = entries.find((e) => e.email === entry.email);
  if (!already) entries.push(entry);
  await writeFile(entries);
  const position = entries.findIndex((e) => e.email === entry.email) + 1;
  return { position: position || entries.length, total: entries.length };
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

    // Side effect — never blocks
    void fireWebhook(entry);

    // Storage — Supabase if configured, file otherwise
    const result = isSupabaseConfigured()
      ? await saveToSupabase(entry.email, entry.source!)
      : await saveToFile(entry);

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  if (isSupabaseConfigured()) {
    const supabase = getSupabase()!;
    const { count } = await supabase
      .from("waitlist")
      .select("id", { count: "exact", head: true });
    return NextResponse.json({ total: count ?? 0, source: "supabase" });
  }
  const entries = await readFile();
  return NextResponse.json({ total: entries.length, source: "file" });
}
