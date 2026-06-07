// POST /functions/v1/save-settings
// Stores the connected account: X token (server-side only), posting schedule,
// handle, and brand material. The X token never round-trips back to the browser.
//
// Body: { account_id?, handle?, display_name?, brand_material?, x_access_token?,
//         posts_per_period?, period?, timezone? }
// Returns: { ok, account_id }

import { handlePreflight, json } from "../_shared/cors.ts";
import { admin, currentAccount } from "../_shared/db.ts";

Deno.serve(async (req) => {
  const pre = handlePreflight(req);
  if (pre) return pre;

  try {
    const db = admin();
    const body = await req.json().catch(() => ({}));

    // Only set columns that were actually provided (don't clobber the token with null).
    const patch: Record<string, unknown> = {};
    if (body.handle !== undefined) patch.handle = String(body.handle).replace(/^@/, "");
    if (body.display_name !== undefined) patch.display_name = body.display_name;
    if (body.brand_material !== undefined) patch.brand_material = body.brand_material;
    if (body.x_access_token) patch.x_access_token = body.x_access_token;
    if (body.posts_per_period !== undefined) {
      patch.posts_per_period = Math.max(1, Number(body.posts_per_period) || 5);
    }
    if (body.period !== undefined && ["day", "week", "month"].includes(body.period)) {
      patch.period = body.period;
    }
    if (body.timezone !== undefined) patch.timezone = body.timezone;

    // Resolve which account to write (single-tenant: the current active one).
    const target = body.account_id
      ? { id: body.account_id }
      : await currentAccount();

    let accountId: string;
    if (target?.id) {
      const { data, error } = await db
        .from("accounts")
        .update(patch)
        .eq("id", target.id)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      accountId = data.id;
    } else {
      const { data, error } = await db
        .from("accounts")
        .insert(patch)
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      accountId = data.id;
    }

    return json({ ok: true, account_id: accountId });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
