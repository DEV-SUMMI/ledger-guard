/**
 * Browser-side encryption (Web Crypto). Nothing here ever leaves the device in plain form.
 *
 * password ──PBKDF2-SHA256──▶ master key ──HKDF──┬─▶ auth key  (sent to the server as the login secret)
 *                                                └─▶ enc key   (stays here; unlocks the vault key)
 * vault key: random AES-256-GCM key, stored on the server only in encrypted ("protected") form.
 */

export const KDF_ITERATIONS = 600_000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  for (const b of view) binary += String.fromCharCode(b);
  return btoa(binary);
}

export function fromBase64(value: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(value), (c) => c.charCodeAt(0));
}

export function randomBytes(length: number): Uint8Array<ArrayBuffer> {
  return crypto.getRandomValues(new Uint8Array(length));
}

export function newKdfSalt(): string {
  return toBase64(randomBytes(16));
}

export interface DerivedKeys {
  /** Base64 secret the server checks at sign-in; can't be reversed into the password */
  authKey: string;
  /** Unlocks the vault key; never sent anywhere */
  encKey: CryptoKey;
}

export async function deriveKeys(password: string, kdfSalt: string, iterations: number): Promise<DerivedKeys> {
  const passwordKey = await crypto.subtle.importKey("raw", encoder.encode(password.normalize("NFKC")), "PBKDF2", false, [
    "deriveBits",
  ]);
  const master = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: fromBase64(kdfSalt), iterations },
    passwordKey,
    256,
  );
  const hkdfKey = await crypto.subtle.importKey("raw", master, "HKDF", false, ["deriveBits", "deriveKey"]);
  const hkdf = (info: string) => ({ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(32), info: encoder.encode(info) });

  const authBits = await crypto.subtle.deriveBits(hkdf("digital-vault/auth/v1"), hkdfKey, 256);
  const encKey = await crypto.subtle.deriveKey(hkdf("digital-vault/enc/v1"), hkdfKey, { name: "AES-GCM", length: 256 }, false, [
    "encrypt",
    "decrypt",
  ]);
  return { authKey: toBase64(authBits), encKey };
}

/** Encrypts bytes as `v1.<iv>.<ciphertext>`. `context` is bound in so payloads can't be swapped between uses. */
export async function seal(key: CryptoKey, plain: Uint8Array<ArrayBuffer>, context: string): Promise<string> {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv, additionalData: encoder.encode(context) }, key, plain);
  return `v1.${toBase64(iv)}.${toBase64(ct)}`;
}

export async function open(key: CryptoKey, payload: string, context: string): Promise<Uint8Array<ArrayBuffer>> {
  const [version, ivB64, ctB64] = payload.split(".");
  if (version !== "v1" || !ivB64 || !ctB64) throw new Error("Unsupported payload");
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: fromBase64(ivB64), additionalData: encoder.encode(context) },
    key,
    fromBase64(ctB64),
  );
  return new Uint8Array(plain);
}

const VAULT_KEY_CONTEXT = "digital-vault/vault-key/v1";

async function importVaultKey(raw: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  // Non-extractable: once imported, page scripts can use the key but never read it out.
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);
}

/**
 * Class-project key escrow: the vault key is also wrapped (RSA-OAEP) to the admin's public key, and
 * the admin's private key is sealed with the admin's own vault key. Mirrored in scripts/seed-admin.mjs.
 */
const ESCROW_KEY_CONTEXT = "digital-vault/admin-escrow-key/v1";
const RSA_OAEP = { name: "RSA-OAEP", hash: "SHA-256" } as const;

/** Creates a new vault key and returns it together with its encrypted form for the server. */
export async function createVaultKey(
  encKey: CryptoKey,
  adminPublicKey?: string | null,
): Promise<{ vaultKey: CryptoKey; protectedVaultKey: string; adminWrappedVaultKey?: string }> {
  const raw = randomBytes(32);
  try {
    let adminWrappedVaultKey: string | undefined;
    if (adminPublicKey) {
      const publicKey = await crypto.subtle.importKey("spki", fromBase64(adminPublicKey), RSA_OAEP, false, ["encrypt"]);
      adminWrappedVaultKey = toBase64(await crypto.subtle.encrypt({ name: "RSA-OAEP" }, publicKey, raw));
    }
    return {
      vaultKey: await importVaultKey(raw),
      protectedVaultKey: await seal(encKey, raw, VAULT_KEY_CONTEXT),
      adminWrappedVaultKey,
    };
  } finally {
    raw.fill(0);
  }
}

/** Admin only: opens the escrow private key sealed with the admin's own vault key. */
export async function unlockEscrowPrivateKey(adminVaultKey: CryptoKey, wrapped: string): Promise<CryptoKey> {
  const pkcs8 = await open(adminVaultKey, wrapped, ESCROW_KEY_CONTEXT);
  try {
    return await crypto.subtle.importKey("pkcs8", pkcs8, RSA_OAEP, false, ["decrypt"]);
  } finally {
    pkcs8.fill(0);
  }
}

/** Admin only: recovers a member's vault key from the copy wrapped to the admin's public key. */
export async function unwrapMemberVaultKey(escrowPrivateKey: CryptoKey, wrapped: string): Promise<CryptoKey> {
  const raw = new Uint8Array(await crypto.subtle.decrypt({ name: "RSA-OAEP" }, escrowPrivateKey, fromBase64(wrapped)));
  try {
    return await importVaultKey(raw);
  } finally {
    raw.fill(0);
  }
}

export async function unlockVaultKey(encKey: CryptoKey, protectedVaultKey: string): Promise<CryptoKey> {
  const raw = await open(encKey, protectedVaultKey, VAULT_KEY_CONTEXT);
  try {
    return await importVaultKey(raw);
  } finally {
    raw.fill(0);
  }
}

export async function encryptJson(vaultKey: CryptoKey, value: unknown, context: string): Promise<string> {
  return seal(vaultKey, encoder.encode(JSON.stringify(value)), context);
}

export async function decryptJson<T>(vaultKey: CryptoKey, payload: string, context: string): Promise<T> {
  return JSON.parse(decoder.decode(await open(vaultKey, payload, context))) as T;
}
