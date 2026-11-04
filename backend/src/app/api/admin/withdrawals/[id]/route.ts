import { audit } from "@/lib/audit";
import { query } from "@/lib/db";
import { clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";
import { uuidParam, withdrawalResolveSchema } from "@/lib/validation";

interface Ctx {
  params: Promise<{ id: string }>;
}

/** Fulfil a pending request (the hold stays) or reject it (the amount returns to the balance). */
export const PATCH = route<Ctx>(async (req, ctx) => {
  const admin = await requireAdmin(req);
  const parsed = uuidParam.safeParse((await ctx.params).id);
  if (!parsed.success) throw new HttpError(404, "Request not found");
  const { status } = await readJson(req, withdrawalResolveSchema);

  // Only a still-pending request can be resolved, so a double click can't refund twice.
  const rows = await query<{ email: string; amountCents: number }>(
    `WITH r AS (
       UPDATE withdrawal_requests SET status = $2, resolved_at = now(), resolved_by = $3
        WHERE id = $1 AND status = 'pending'
        RETURNING user_id, amount_cents
     ), refund AS (
       UPDATE users SET balance_cents = balance_cents + r.amount_cents
         FROM r WHERE users.id = r.user_id AND $2 = 'rejected'
     )
     SELECT u.email, r.amount_cents::float8 AS "amountCents" FROM r JOIN users u ON u.id = r.user_id`,
    [parsed.data, status, admin.id],
  );
  const done = rows[0];
  if (!done) throw new HttpError(409, "This request was already resolved or doesn't exist");

  await audit({
    event: status === "fulfilled" ? "Withdrawal fulfilled" : "Withdrawal rejected",
    userId: admin.id,
    actorEmail: admin.email,
    detail: `${done.email}: $${(done.amountCents / 100).toFixed(2)}`,
    ip: clientIp(req),
  });
  return json({ ok: true });
});
