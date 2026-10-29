import { query } from "@/lib/db";
import { json, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";

/** Account information only; vault contents come from the audited escrow route (users/[id]/items). */
export const GET = route(async (req) => {
  await requireAdmin(req);
  const users = await query(
    `SELECT u.id, u.name, u.email, u.role, u.status,
            u.created_at AS "createdAt", u.last_active_at AS "lastActiveAt",
            (SELECT count(*)::int FROM vault_items v WHERE v.owner_id = u.id) AS items
       FROM users u
      ORDER BY u.created_at DESC
      LIMIT 1000`,
  );
  return json({ users });
});
