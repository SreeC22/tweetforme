// Layered rate limiting for public server routes (e.g. the landing preview,
// which spends a shared LLM key). Defense in depth:
//   1. in-memory per-instance burst guard  — instant, zero-dependency
//   2. Postgres sliding window (shared)     — caps a client across instances
// Both fail OPEN on infra errors: a limiter bug must never take down the UX.
// Strongest layer (edge, before the function runs) is the Vercel WAF rate-limit
// rule, configured in the dashboard — see docs/SECURITY note.

import crypto from "node:crypto";
import { getSupabase } from "@/lib/server/supabase";

const MEM_WINDOW_MS = 60_000;
const MEM_MAX = 10;
const mem = new Map<string, number[]>();

/** Best-effort client IP from proxy headers. */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") || "";
  const first = xff.split(",")[0].trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

/** A privacy-preserving bucket key — hashed IP, never stored/raw. */
export function ipBucket(ip: string, purpose = "preview"): string {
  const h = crypto.createHash("sha256").update(`${purpose}:${ip}`).digest("hex");
  return `${purpose}:${h.slice(0, 32)}`;
}

function memOverLimit(bucket: string): boolean {
  const now = Date.now();
  const arr = (mem.get(bucket) || []).filter((t) => now - t < MEM_WINDOW_MS);
  arr.push(now);
  mem.set(bucket, arr);
  if (mem.size > 10_000) {
    for (const [k, v] of mem) {
      const keep = v.filter((t) => now - t < MEM_WINDOW_MS);
      if (keep.length) mem.set(k, keep);
      else mem.delete(k);
    }
  }
  return arr.length > MEM_MAX;
}

/**
 * Returns true if the request is ALLOWED, false if it should be rate-limited.
 * Checks the cheap in-memory guard first, then the shared Postgres window.
 */
export async function allowRequest(
  bucket: string,
  max = MEM_MAX,
  windowSeconds = 60,
): Promise<boolean> {
  if (memOverLimit(bucket)) return false;

  const sb = getSupabase();
  if (!sb) return true; // no shared store configured — memory guard is all we have

  try {
    const { data, error } = await sb.rpc("rate_limit_check", {
      p_bucket: bucket,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (error) return true; // fail open — never break the UX on an infra hiccup
    return data !== false;
  } catch {
    return true;
  }
}
