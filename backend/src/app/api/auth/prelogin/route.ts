import { hmac } from "@/lib/crypto";
import { query } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { clientIp, json, readJson, route } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
import { preloginSchema } from "@/lib/validation";

const DEFAULT_ITERATIONS = 600_000;

/**
 * Returns the key-derivation settings the browser needs before it can sign in.
 * Unknown emails get stable fake settings, so this can't be used to check who has an account.
 */
export const POST = route(async (req) => {
  rateLimit("prelogin", clientIp(req), 30, 10 * 60 * 1000);
  const { email } = await readJson(req, preloginSchema);

  const rows = await query<{ kdf_salt: string; kdf_iterations: number }>(
    "SELECT kdf_salt, kdf_iterations FROM users WHERE email = $1",
    [email],
  );
  if (rows[0]) return json({ kdfSalt: rows[0].kdf_salt, kdfIterations: rows[0].kdf_iterations });

  const fakeSalt = hmac(getEnv().appSecret, `prelogin:${email}`).subarray(0, 16).toString("base64");
  return json({ kdfSalt: fakeSalt, kdfIterations: DEFAULT_ITERATIONS });
});
