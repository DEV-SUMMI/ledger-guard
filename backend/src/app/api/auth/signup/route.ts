import { audit } from "@/lib/audit";
import { hashSecret } from "@/lib/crypto";
import { query } from "@/lib/db";
import { clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { createSession, type SessionUser } from "@/lib/session";
import { signupSchema } from "@/lib/validation";

export const POST = route(async (req) => {
  const ip = clientIp(req);
  rateLimit("signup", ip, 10, 60 * 60 * 1000);
  const body = await readJson(req, signupSchema);

  // Sign-up only ever creates members; admins are seeded by scripts/seed-admin.mjs.
  const authHash = await hashSecret(body.authKey);
  const rows = await query<SessionUser>(
    `INSERT INTO users (email, name, role, auth_hash, kdf_salt, kdf_iterations, protected_vault_key, admin_wrapped_vault_key, last_active_at)
     VALUES ($1, $2, 'user', $3, $4, $5, $6, $7, now())
     ON CONFLICT (email) DO NOTHING
     RETURNING id, email, name, role`,
    [
      body.email,
      body.name,
      authHash,
      body.kdfSalt,
      body.kdfIterations,
      body.protectedVaultKey,
      body.adminWrappedVaultKey ?? null,
    ],
  );
  const user = rows[0];
  if (!user) throw new HttpError(409, "An account with this email already exists");

  await audit({ event: "New sign-up", userId: user.id, actorEmail: user.email, ip });

  const res = json({ user }, 201);
  await createSession(res, user.id, ip, req.headers.get("user-agent"));
  return res;
});
