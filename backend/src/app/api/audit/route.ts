import { audit } from "@/lib/audit";
import { query, withUser } from "@/lib/db";
import { clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { requireUser } from "@/lib/session";
import { clientAuditSchema } from "@/lib/validation";

/** The signed-in member's own security history. */
export const GET = route(async (req) => {
  const user = await requireUser(req);
  const events = await query(
    `SELECT id, level, event, detail, ip, created_at AS "createdAt"
       FROM audit_events WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100`,
    [user.id],
  );
  return json({ events });
});

/** Reveal and copy happen in the browser, so the browser reports them here. */
export const POST = route(async (req) => {
  const user = await requireUser(req);
  rateLimit("client-audit", user.id, 300, 10 * 60 * 1000);
  const { event, itemId } = await readJson(req, clientAuditSchema);

  const item = await withUser(user.id, async (db) => {
    const { rows } = await db.query<{ category: string }>(
      "SELECT category FROM vault_items WHERE id = $1 AND owner_id = $2",
      [itemId, user.id],
    );
    return rows[0];
  });
  if (!item) throw new HttpError(404, "Item not found");

  await audit({
    event: event === "item.revealed" ? "Item revealed" : "Item copied",
    userId: user.id,
    actorEmail: user.email,
    detail: item.category,
    ip: clientIp(req),
  });
  return json({ ok: true }, 201);
});
