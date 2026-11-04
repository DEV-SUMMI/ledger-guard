import { audit } from "@/lib/audit";
import { query } from "@/lib/db";
import { clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";
import { balanceAdjustSchema, uuidParam } from "@/lib/validation";

interface Ctx {
  params: Promise<{ id: string }>;
}

const usd = (cents: number) => `$${(cents / 100).toFixed(2)}`;

/** Increase or decrease a member's dollar balance. The update is atomic and can't go below zero. */
export const PATCH = route<Ctx>(async (req, ctx) => {
  const admin = await requireAdmin(req);
  const parsed = uuidParam.safeParse((await ctx.params).id);
  if (!parsed.success) throw new HttpError(404, "User not found");
  const id = parsed.data;

  const { operation, amount } = await readJson(req, balanceAdjustSchema);
  const cents = Math.round(Number(amount) * 100);
  const delta = operation === "increase" ? cents : -cents;

  const rows = await query<{ email: string; balanceCents: string }>(
    `UPDATE users SET balance_cents = balance_cents + $2
      WHERE id = $1 AND balance_cents + $2 >= 0
      RETURNING email, balance_cents AS "balanceCents"`,
    [id, delta],
  );
  const target = rows[0];
  if (!target) {
    const exists = await query("SELECT 1 FROM users WHERE id = $1", [id]);
    if (exists.length === 0) throw new HttpError(404, "User not found");
    throw new HttpError(400, "That would take the balance below $0.00");
  }

  const balanceCents = Number(target.balanceCents);
  await audit({
    event: operation === "increase" ? "Balance increased" : "Balance decreased",
    level: "info",
    userId: admin.id,
    actorEmail: admin.email,
    detail: `${target.email}: ${operation === "increase" ? "+" : "-"}${usd(cents)} → ${usd(balanceCents)}`,
    ip: clientIp(req),
  });
  return json({ balanceCents });
});
