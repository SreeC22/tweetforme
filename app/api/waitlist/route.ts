import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function isValidEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; source?: string };
    const email = (body.email || "").trim().toLowerCase();

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "That email doesn't look right." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existing } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email)
      .single();

    if (!existing) {
      // Insert new entry
      const { error: insertError } = await supabase.from("waitlist").insert({
        email,
        source: body.source || "landing",
      });

      if (insertError) {
        throw new Error(insertError.message);
      }
    }

    // Get position (count of entries before this one)
    const { count } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true });

    const { data: positionData } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email)
      .single();

    // Get position by counting entries with id <= this one
    const { count: position } = await supabase
      .from("waitlist")
      .select("*", { count: "exact", head: true })
      .lte("id", positionData?.id ?? 0);

    return NextResponse.json({
      ok: true,
      position: position || 1,
      total: count || 1,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function GET() {
  const { count } = await supabase
    .from("waitlist")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ total: count || 0 });
}
