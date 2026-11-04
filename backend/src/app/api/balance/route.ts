import { query } from "@/lib/db";
import { json, route } from "@/lib/http";
import { requireUser } from "@/lib/session";

/** The member's own balance (read-only; only admins can change it). */
export const GET = route(async (req) => {
  const user = await requireUser(req);
  const rows = await query<{ balanceCents: string }>(
    `SELECT balance_cents AS "balanceCents" FROM users WHERE id = $1`,
    [user.id],
  );
  return json({ balanceCents: Number(rows[0]?.balanceCents ?? 0) });
});
