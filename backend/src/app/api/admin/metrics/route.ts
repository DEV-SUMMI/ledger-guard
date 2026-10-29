import { query } from "@/lib/db";
import { json, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";

export const GET = route(async (req) => {
  await requireAdmin(req);

  const [totals] = await query<{ users: number; active: number; suspended: number; items: number; activeToday: number }>(
    `SELECT (SELECT count(*)::int FROM users) AS users,
            (SELECT count(*)::int FROM users WHERE status = 'active') AS active,
            (SELECT count(*)::int FROM users WHERE status = 'suspended') AS suspended,
            (SELECT count(*)::int FROM vault_items) AS items,
            (SELECT count(*)::int FROM users WHERE last_active_at > now() - interval '1 day') AS "activeToday"`,
  );

  const signups = await query<{ day: string; count: number }>(
    `SELECT to_char(d, 'YYYY-MM-DD') AS day, count(u.id)::int AS count
       FROM generate_series(current_date - 13, current_date, interval '1 day') AS d
       LEFT JOIN users u ON u.created_at::date = d::date
      GROUP BY d ORDER BY d`,
  );

  return json({ totals, signups });
});
