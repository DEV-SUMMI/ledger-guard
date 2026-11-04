import { audit } from "@/lib/audit";
import { query } from "@/lib/db";
import { clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { requireAdmin } from "@/lib/session";
import { userStatusSchema, uuidParam } from "@/lib/validation";

interface Ctx {
  params: Promise<{ id: string }>;
}

interface AdminUserDetail {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  profileNote: string;
  balanceCents: number;
  items: number;
  createdAt: string;
  lastActiveAt: string | null;
}

/**
 * Account detail for one member. Returns the member's own admin-visible profile note
 * (an openly non-secret, plaintext field) — never vault contents, which stay encrypted
 * and unreadable to admins.
 */
export const GET = route<Ctx>(async (req, ctx) => {
  const admin = await requireAdmin(req);
  const parsed = uuidParam.safeParse((await ctx.params).id);
  if (!parsed.success) throw new HttpError(404, "User not found");
  const id = parsed.data;

  const rows = await query<AdminUserDetail>(
    `SELECT u.id, u.name, u.email, u.role, u.status,
            u.profile_note AS "profileNote", u.balance_cents::float8 AS "balanceCents",
            u.created_at AS "createdAt", u.last_active_at AS "lastActiveAt",
            (SELECT count(*)::int FROM vault_items v WHERE v.owner_id = u.id) AS items
       FROM users u
      WHERE u.id = $1`,
    [id],
  );
  const user = rows[0];
  if (!user) throw new HttpError(404, "User not found");

  await audit({
    event: "Viewed user profile",
    userId: admin.id,
    actorEmail: admin.email,
    detail: user.email,
    ip: clientIp(req),
  });
  return json({ user });
});

/** Suspend or reactivate an account. Suspending signs the member out everywhere. */
export const PATCH = route<Ctx>(async (req, ctx) => {
  const admin = await requireAdmin(req);
  const parsed = uuidParam.safeParse((await ctx.params).id);
  if (!parsed.success) throw new HttpError(404, "User not found");
  const id = parsed.data;
  if (id === admin.id) throw new HttpError(400, "You can't change your own status");

  const { status } = await readJson(req, userStatusSchema);
  const rows = await query<{ email: string }>(
    "UPDATE users SET status = $2, failed_logins = 0, locked_until = NULL WHERE id = $1 RETURNING email",
    [id, status],
  );
  const target = rows[0];
  if (!target) throw new HttpError(404, "User not found");

  if (status === "suspended") await query("DELETE FROM sessions WHERE user_id = $1", [id]);

  await audit({
    event: status === "suspended" ? "Account suspended" : "Account reactivated",
    level: status === "suspended" ? "warning" : "info",
    userId: admin.id,
    actorEmail: admin.email,
    detail: target.email,
    ip: clientIp(req),
  });
  return json({ ok: true });
});
