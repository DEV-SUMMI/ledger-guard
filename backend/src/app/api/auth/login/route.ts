import { audit } from "@/lib/audit";
import { verifyAgainstDummy, verifySecret } from "@/lib/crypto";
import { query } from "@/lib/db";
import { clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, type SessionUser } from "@/lib/session";
import { loginSchema } from "@/lib/validation";

const MAX_FAILURES = 10;
const LOCK_MINUTES = 15;
const INVALID = "Invalid email or password";

interface UserRow extends SessionUser {
  status: "active" | "suspended";
  auth_hash: string;
  protected_vault_key: string;
  failed_logins: number;
  locked_until: Date | null;
}

export const POST = route(async (req) => {
  const ip = clientIp(req);
  rateLimit("login", ip, 20, 10 * 60 * 1000);
  const { email, authKey } = await readJson(req, loginSchema);

  const rows = await query<UserRow>(
    `SELECT id, email, name, role, status, auth_hash, protected_vault_key, failed_logins, locked_until
       FROM users WHERE email = $1`,
    [email],
  );
  const user = rows[0];

  if (!user) {
    await verifyAgainstDummy(authKey);
    await audit({ event: "Failed sign-in", level: "warning", actorEmail: email, detail: "Unknown account", ip });
    throw new HttpError(401, INVALID);
  }

  if (user.locked_until && user.locked_until > new Date()) {
    await audit({ event: "Sign-in blocked", level: "warning", userId: user.id, actorEmail: email, detail: "Account temporarily locked", ip });
    throw new HttpError(429, "Too many failed attempts. Try again later.");
  }

  if (!(await verifySecret(authKey, user.auth_hash))) {
    const failures = user.failed_logins + 1;
    const lock = failures >= MAX_FAILURES;
    await query(
      `UPDATE users SET failed_logins = $2,
              locked_until = CASE WHEN $3 THEN now() + $4 * interval '1 minute' ELSE locked_until END
        WHERE id = $1`,
      [user.id, lock ? 0 : failures, lock, LOCK_MINUTES],
    );
    await audit({
      event: lock ? "Account locked" : "Failed sign-in",
      level: lock ? "critical" : "warning",
      userId: user.id,
      actorEmail: email,
      detail: lock ? `${MAX_FAILURES} failed attempts — locked for ${LOCK_MINUTES} min` : "Wrong password",
      ip,
    });
    throw new HttpError(401, INVALID);
  }

  // Checked only after the password, so suspension status isn't revealed to strangers.
  if (user.status !== "active") {
    await audit({ event: "Sign-in blocked", level: "warning", userId: user.id, actorEmail: email, detail: "Account suspended", ip });
    throw new HttpError(403, "This account is suspended");
  }

  await query("UPDATE users SET failed_logins = 0, locked_until = NULL, last_active_at = now() WHERE id = $1", [user.id]);
  await audit({ event: "Signed in", userId: user.id, actorEmail: email, ip });

  const res = json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    vault: { protectedVaultKey: user.protected_vault_key },
  });
  await createSession(res, user.id, ip, req.headers.get("user-agent"));
  return res;
});
