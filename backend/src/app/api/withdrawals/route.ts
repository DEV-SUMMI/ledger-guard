import { audit } from "@/lib/audit";
import { query } from "@/lib/db";
import { clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { withdrawalCreateSchema } from "@/lib/validation";

/** The member's own withdrawal requests, newest first. */
export const GET = route(async (req) => {
  const user = await requireUser(req);
  const withdrawals = await query(
    `SELECT id, amount_cents::float8 AS "amountCents", status,
            created_at AS "createdAt", resolved_at AS "resolvedAt"
       FROM withdrawal_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
    [user.id],
  );
  return json({ withdrawals });
});

/**
 * Asks to withdraw part of the balance. The amount is deducted (held) in the same statement
 * that checks it, so it can never exceed the balance, even with concurrent requests.
 */
export const POST = route(async (req) => {
  const user = await requireUser(req);
  const { amount } = await readJson(req, withdrawalCreateSchema);
  const cents = Math.round(Number(amount) * 100);

  const rows = await query<{ balanceCents: number }>(
    `WITH held AS (
       UPDATE users SET balance_cents = balance_cents - $2
        WHERE id = $1 AND balance_cents >= $2
        RETURNING balance_cents
     ), req AS (
       INSERT INTO withdrawal_requests (user_id, amount_cents)
       SELECT $1, $2 FROM held
       RETURNING id
     )
     SELECT held.balance_cents::float8 AS "balanceCents" FROM held, req`,
    [user.id, cents],
  );
  if (!rows[0]) throw new HttpError(400, "You can't withdraw more than your balance");

  await audit({
    event: "Withdrawal requested",
    userId: user.id,
    actorEmail: user.email,
    detail: `$${(cents / 100).toFixed(2)}`,
    ip: clientIp(req),
  });
  return json({ balanceCents: rows[0].balanceCents }, 201);
});
