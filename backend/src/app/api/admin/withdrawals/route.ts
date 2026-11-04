import { query } from "@/lib/db";
import { json, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";

/** All withdrawal requests, pending first. */
export const GET = route(async (req) => {
  await requireAdmin(req);
  const withdrawals = await query(
    `SELECT w.id, w.user_id AS "userId", u.name, u.email,
            w.amount_cents::float8 AS "amountCents", w.status,
            w.created_at AS "createdAt", w.resolved_at AS "resolvedAt"
       FROM withdrawal_requests w JOIN users u ON u.id = w.user_id
      ORDER BY (w.status = 'pending') DESC, w.created_at DESC
      LIMIT 500`,
  );
  return json({ withdrawals });
});
