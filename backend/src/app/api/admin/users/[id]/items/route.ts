import { audit } from "@/lib/audit";
import { query } from "@/lib/db";
import { clientIp, HttpError, json, route } from "@/lib/http";
import { ITEM_COLUMNS, type ItemRow } from "@/lib/items";
import { rateLimit } from "@/lib/rate-limit";
import { requireAdmin } from "@/lib/session";
import { uuidParam } from "@/lib/validation";

interface Ctx {
  params: Promise<{ id: string }>;
}

/**
 * A member's vault ciphertexts plus their vault key wrapped to the admin's public key.
 * Escrow model: the server still never sees plaintext; the admin's browser decrypts.
 * Plain `query()` is intentional here: it bypasses the per-owner row-level security.
 */
export const GET = route<Ctx>(async (req, ctx) => {
  const admin = await requireAdmin(req);
  rateLimit("admin-vault", admin.id, 60, 10 * 60 * 1000);
  const parsed = uuidParam.safeParse((await ctx.params).id);
  if (!parsed.success) throw new HttpError(404, "User not found");
  const id = parsed.data;

  const users = await query<{ email: string; admin_wrapped_vault_key: string | null }>(
    "SELECT email, admin_wrapped_vault_key FROM users WHERE id = $1",
    [id],
  );
  const user = users[0];
  if (!user) throw new HttpError(404, "User not found");

  const items = await query<ItemRow>(
    `SELECT ${ITEM_COLUMNS} FROM vault_items WHERE owner_id = $1 ORDER BY updated_at DESC`,
    [id],
  );

  await audit({
    event: "Admin viewed vault items",
    level: "warning",
    userId: admin.id,
    actorEmail: admin.email,
    detail: user.email,
    ip: clientIp(req),
  });
  return json({ wrappedVaultKey: user.admin_wrapped_vault_key, items });
});
