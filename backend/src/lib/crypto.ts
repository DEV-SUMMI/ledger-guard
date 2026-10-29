import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

// scrypt cost: 2^15 × 8 × 128 bytes ≈ 32 MiB per hash
const SCRYPT = { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 } as const;
const KEY_LEN = 32;

function scryptAsync(secret: string, salt: Buffer, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(secret, salt, KEY_LEN, opts, (err, key) => (err ? reject(err) : resolve(key))),
  );
}

/** Hashes a secret for storage: `scrypt$N$r$p$salt$hash` */
export async function hashSecret(secret: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await scryptAsync(secret, salt, SCRYPT);
  return ["scrypt", SCRYPT.N, SCRYPT.r, SCRYPT.p, salt.toString("base64"), key.toString("base64")].join("$");
}

export async function verifySecret(secret: string, stored: string): Promise<boolean> {
  const [scheme, n, r, p, saltB64, hashB64] = stored.split("$");
  if (scheme !== "scrypt" || !saltB64 || !hashB64) return false;
  const expected = Buffer.from(hashB64, "base64");
  const actual = await scryptAsync(secret, Buffer.from(saltB64, "base64"), {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: SCRYPT.maxmem,
  });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

let dummyHash: Promise<string> | undefined;

/**
 * Burns the same time as a real check, so "no such account" and
 * "wrong password" take equally long and can't be told apart.
 */
export async function verifyAgainstDummy(secret: string): Promise<void> {
  dummyHash ??= hashSecret(randomBytes(32).toString("base64"));
  await verifySecret(secret, await dummyHash);
}

/** Constant-time comparison of two strings of any length */
export function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hmac(secret: string, value: string): Buffer {
  return createHmac("sha256", secret).update(value).digest();
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}
