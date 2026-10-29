import { query } from "@/lib/db";
import { json, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";

/** The admin's own escrow private key, sealed with their vault key (only they can open it). */
export const GET = route(async (req) => {
  const admin = await requireAdmin(req);
  const rows = await query<{ admin_private_key_wrapped: string | null }>(
    "SELECT admin_private_key_wrapped FROM users WHERE id = $1",
    [admin.id],
  );
  return json({ wrappedPrivateKey: rows[0]?.admin_private_key_wrapped ?? null });
});
