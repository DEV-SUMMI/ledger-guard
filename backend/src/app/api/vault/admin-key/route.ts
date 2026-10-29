import { query } from "@/lib/db";
import { json, route } from "@/lib/http";

/** The admin's escrow public key (base64 SPKI). Needed before sign-up, so no session is required. */
export const GET = route(async () => {
  const rows = await query<{ public_key: string }>("SELECT public_key FROM admin_escrow WHERE id");
  return json({ publicKey: rows[0]?.public_key ?? null });
});
