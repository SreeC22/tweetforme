// Supabase admin client for Edge Functions (service role — bypasses RLS).
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are injected automatically by the
// Edge runtime; you don't set them yourself.

import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

let cached: SupabaseClient | null = null;

export function admin(): SupabaseClient {
  if (cached) return cached;
  const url = Deno.env.get("SUPABASE_URL")!;
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  cached = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export interface Account {
  id: string;
  handle: string | null;
  display_name: string | null;
  brand_material: string | null;
  x_access_token: string | null;
  posts_per_period: number;
  period: "day" | "week" | "month";
  timezone: string;
  is_active: boolean;
}

/**
 * The pipeline is single-tenant for the hackathon: there's one "current" account
 * (the most recently updated active one). Multi-user just swaps this for an
 * auth.uid() lookup.
 */
export async function currentAccount(): Promise<Account | null> {
  const { data } = await admin()
    .from("accounts")
    .select("*")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data as Account) ?? null;
}
