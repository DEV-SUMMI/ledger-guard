import { query } from "@/lib/db";
import { json, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";

export const GET = route(async (req) => {
  await requireAdmin(req);
  const events = await query(
    `SELECT id, level, event, actor_email AS actor, detail, ip, created_at AS "createdAt"
       FROM audit_events ORDER BY created_at DESC LIMIT 200`,
  );
  return json({ events });
});
