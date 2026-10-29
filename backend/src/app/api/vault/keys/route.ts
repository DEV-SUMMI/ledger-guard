import { query } from "@/lib/db";
import { json, route } from "@/lib/http";
import { requireUser } from "@/lib/session";

/** What the browser needs to unlock the vault again (e.g. after a page reload). */
export const GET = route(async (req) => {
  const user = await requireUser(req);
  const rows = await query<{ kdf_salt: string; kdf_iterations: number; protected_vault_key: string }>(
    "SELECT kdf_salt, kdf_iterations, protected_vault_key FROM users WHERE id = $1",
    [user.id],
  );
  const row = rows[0];
  return json({ kdfSalt: row.kdf_salt, kdfIterations: row.kdf_iterations, protectedVaultKey: row.protected_vault_key });
});
