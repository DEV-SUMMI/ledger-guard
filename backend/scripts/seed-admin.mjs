// Creates (or updates) the admin account from ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME.
// Admins can't sign up through the app; this is the only way to make one.
//
//   node scripts/seed-admin.mjs                    create the admin, or confirm it is up to date
//   node scripts/seed-admin.mjs --reset-password   also change an existing admin's password
//   node scripts/seed-admin.mjs --if-configured    exit quietly when ADMIN_EMAIL is unset (used on start)
//
// The vault is zero-knowledge, so this mirrors exactly what the browser does at sign-up
// (frontend/src/lib/crypto.ts): password ─PBKDF2→ master ─HKDF→ auth key + enc key, a random
// vault key sealed with the enc key, and the server's scrypt hash of the auth key
// (backend/src/lib/crypto.ts). Keep the three in sync.
import { randomBytes, scrypt, timingSafeEqual, webcrypto } from "node:crypto";
import { connectWithRetry } from "./connect.mjs";

const { subtle } = webcrypto;
const KDF_ITERATIONS = 600_000;
const MIN_PASSWORD = 12;
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const VAULT_KEY_CONTEXT = "digital-vault/vault-key/v1";
// Class-project key escrow (see frontend/src/lib/crypto.ts): members' vault keys are also wrapped to this
// RSA public key; the private key is sealed with the admin's own vault key.
const ESCROW_KEY_CONTEXT = "digital-vault/admin-escrow-key/v1";
const encoder = new TextEncoder();

const args = new Set(process.argv.slice(2));
const resetPassword = args.has("--reset-password");

const email = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD ?? "";
const name = (process.env.ADMIN_NAME ?? "Admin").trim();

if (!email && args.has("--if-configured")) process.exit(0);

const problems = [];
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) problems.push("ADMIN_EMAIL must be a valid email");
if (password.length < MIN_PASSWORD) problems.push(`ADMIN_PASSWORD must be at least ${MIN_PASSWORD} characters`);
if (name.length < 2 || name.length > 80) problems.push("ADMIN_NAME must be 2-80 characters");
if (problems.length > 0) {
  console.error(`seed-admin: ${problems.join("; ")} (locally these are read from backend/.env.local)`);
  process.exit(1);
}

const b64 = (bytes) => Buffer.from(bytes).toString("base64");

async function deriveKeys(kdfSalt, iterations) {
  const passwordKey = await subtle.importKey("raw", encoder.encode(password.normalize("NFKC")), "PBKDF2", false, ["deriveBits"]);
  const master = await subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: Buffer.from(kdfSalt, "base64"), iterations },
    passwordKey,
    256,
  );
  const hkdfKey = await subtle.importKey("raw", master, "HKDF", false, ["deriveBits", "deriveKey"]);
  const hkdf = (info) => ({ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(32), info: encoder.encode(info) });
  const authKey = b64(await subtle.deriveBits(hkdf("digital-vault/auth/v1"), hkdfKey, 256));
  const encKey = await subtle.deriveKey(hkdf("digital-vault/enc/v1"), hkdfKey, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  return { authKey, encKey };
}

async function sealBytes(key, bytes, context) {
  const iv = randomBytes(12);
  const ct = await subtle.encrypt({ name: "AES-GCM", iv, additionalData: encoder.encode(context) }, key, bytes);
  return `v1.${b64(iv)}.${b64(ct)}`;
}

async function openBytes(key, payload, context) {
  const [, ivB64, ctB64] = payload.split(".");
  const plain = await subtle.decrypt(
    { name: "AES-GCM", iv: Buffer.from(ivB64, "base64"), additionalData: encoder.encode(context) },
    key,
    Buffer.from(ctB64, "base64"),
  );
  return new Uint8Array(plain);
}

const importAes = (raw) => subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);

/** New RSA-OAEP escrow keypair; the private half is sealed with the admin's vault key. */
async function newEscrow(rawVaultKey) {
  const { publicKey, privateKey } = await subtle.generateKey(
    { name: "RSA-OAEP", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" },
    true,
    ["encrypt", "decrypt"],
  );
  const pkcs8 = new Uint8Array(await subtle.exportKey("pkcs8", privateKey));
  try {
    return {
      publicKey: b64(await subtle.exportKey("spki", publicKey)),
      wrappedPrivateKey: await sealBytes(await importAes(rawVaultKey), pkcs8, ESCROW_KEY_CONTEXT),
    };
  } finally {
    pkcs8.fill(0);
  }
}

const scryptAsync = (secret, salt, opts) =>
  new Promise((resolve, reject) => scrypt(secret, salt, 32, opts, (err, key) => (err ? reject(err) : resolve(key))));

async function hashSecret(secret) {
  const salt = randomBytes(16);
  const key = await scryptAsync(secret, salt, SCRYPT);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, b64(salt), b64(key)].join("$");
}

async function verifySecret(secret, stored) {
  const [scheme, n, r, p, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scryptAsync(secret, Buffer.from(saltB64, "base64"), { N: Number(n), r: Number(r), p: Number(p), maxmem: SCRYPT.maxmem });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

/** Fresh salt, vault key and auth hash for the configured password. */
async function newCredentials() {
  const kdfSalt = b64(randomBytes(16));
  const { authKey, encKey } = await deriveKeys(kdfSalt, KDF_ITERATIONS);
  const raw = randomBytes(32);
  try {
    return {
      kdfSalt,
      protectedVaultKey: await sealBytes(encKey, raw, VAULT_KEY_CONTEXT),
      authHash: await hashSecret(authKey),
      escrow: await newEscrow(raw),
    };
  } finally {
    raw.fill(0);
  }
}

const audit = (client, userId, event, detail) =>
  client.query("INSERT INTO audit_events (user_id, actor_email, level, event, detail) VALUES ($1, $2, 'warning', $3, $4)", [
    userId,
    email,
    event,
    detail,
  ]);

const publishEscrow = (client, publicKey) =>
  client.query(
    `INSERT INTO admin_escrow (id, public_key) VALUES (true, $1)
     ON CONFLICT (id) DO UPDATE SET public_key = EXCLUDED.public_key, updated_at = now()`,
    [publicKey],
  );

const client = await connectWithRetry("seed-admin");
try {
  const { rows } = await client.query(
    "SELECT id, role, status, name, auth_hash, kdf_salt, kdf_iterations, protected_vault_key, admin_private_key_wrapped FROM users WHERE email = $1",
    [email],
  );
  const existing = rows[0];

  if (!existing) {
    const c = await newCredentials();
    const { rows: created } = await client.query(
      `INSERT INTO users (email, name, role, auth_hash, kdf_salt, kdf_iterations, protected_vault_key, admin_private_key_wrapped)
       VALUES ($1, $2, 'admin', $3, $4, $5, $6, $7) RETURNING id`,
      [email, name, c.authHash, c.kdfSalt, KDF_ITERATIONS, c.protectedVaultKey, c.escrow.wrappedPrivateKey],
    );
    await publishEscrow(client, c.escrow.publicKey);
    await audit(client, created[0].id, "Admin account seeded", "Created by seed-admin");
    console.log(`seed-admin: created admin ${email}`);
  } else {
    const { authKey, encKey } = await deriveKeys(existing.kdf_salt, existing.kdf_iterations);
    const passwordMatches = await verifySecret(authKey, existing.auth_hash);

    await client.query("BEGIN");
    try {
      const changes = [];
      if (existing.role !== "admin") changes.push("promoted to admin");
      if (existing.status !== "active") changes.push("reactivated");
      if (existing.name !== name) changes.push("renamed");
      await client.query(
        "UPDATE users SET role = 'admin', status = 'active', name = $2, failed_logins = 0, locked_until = NULL WHERE id = $1",
        [existing.id, name],
      );

      if (!passwordMatches && resetPassword) {
        // A new password means a new vault key: items sealed with the old one could never be opened again.
        const c = await newCredentials();
        const { rowCount } = await client.query("DELETE FROM vault_items WHERE owner_id = $1", [existing.id]);
        await client.query(
          `UPDATE users SET auth_hash = $2, kdf_salt = $3, kdf_iterations = $4, protected_vault_key = $5,
                  admin_private_key_wrapped = $6 WHERE id = $1`,
          [existing.id, c.authHash, c.kdfSalt, KDF_ITERATIONS, c.protectedVaultKey, c.escrow.wrappedPrivateKey],
        );
        // New escrow keypair: members' copies wrapped to the old public key can no longer be opened.
        await publishEscrow(client, c.escrow.publicKey);
        await client.query("UPDATE users SET admin_wrapped_vault_key = NULL WHERE role = 'user'");
        await client.query("DELETE FROM sessions WHERE user_id = $1", [existing.id]);
        changes.push(`password reset (signed out everywhere${rowCount ? `, ${rowCount} vault item(s) deleted` : ""})`);
      }

      if (passwordMatches && !existing.admin_private_key_wrapped) {
        // Admin predates escrow: unwrap the existing vault key and add a keypair sealed with it.
        const raw = await openBytes(encKey, existing.protected_vault_key, VAULT_KEY_CONTEXT);
        const escrow = await newEscrow(raw);
        raw.fill(0);
        await client.query("UPDATE users SET admin_private_key_wrapped = $2 WHERE id = $1", [existing.id, escrow.wrappedPrivateKey]);
        await publishEscrow(client, escrow.publicKey);
        changes.push("escrow key created");
      }

      if (changes.length > 0) await audit(client, existing.id, "Admin account seeded", changes.join(", "));
      await client.query("COMMIT");
      console.log(`seed-admin: ${email} ${changes.length > 0 ? changes.join(", ") : "is up to date"}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }

    if (!passwordMatches && !resetPassword) {
      console.warn(
        "seed-admin: ADMIN_PASSWORD does not match this account's password, so the password was left unchanged.\n" +
          "            To change it, run with --reset-password (make db-seed-admin RESET=1).",
      );
    }
  }
} finally {
  await client.end();
}
