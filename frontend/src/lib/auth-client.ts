import { api } from "@/lib/api";
import { createVaultKey, deriveKeys, KDF_ITERATIONS, newKdfSalt, unlockVaultKey } from "@/lib/crypto";
import { clearVaultKey, setVaultKey } from "@/lib/vault-key";
import type { SessionUser } from "@/types/auth";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function signUp(input: { name: string; email: string; password: string }): Promise<SessionUser> {
  const kdfSalt = newKdfSalt();
  const { authKey, encKey } = await deriveKeys(input.password, kdfSalt, KDF_ITERATIONS);
  // Escrow copy for the admin; if no admin key is published the account simply has none.
  const { publicKey } = await api<{ publicKey: string | null }>("/vault/admin-key").catch(() => ({ publicKey: null }));
  const { vaultKey, protectedVaultKey, adminWrappedVaultKey } = await createVaultKey(encKey, publicKey);

  const { user } = await api<{ user: SessionUser }>("/auth/signup", {
    method: "POST",
    body: {
      name: input.name.trim(),
      email: normalizeEmail(input.email),
      authKey,
      kdfSalt,
      kdfIterations: KDF_ITERATIONS,
      protectedVaultKey,
      adminWrappedVaultKey,
    },
  });
  setVaultKey(vaultKey);
  return user;
}

export async function signIn(input: { email: string; password: string }): Promise<SessionUser> {
  const email = normalizeEmail(input.email);
  const { kdfSalt, kdfIterations } = await api<{ kdfSalt: string; kdfIterations: number }>("/auth/prelogin", {
    method: "POST",
    body: { email },
  });
  const { authKey, encKey } = await deriveKeys(input.password, kdfSalt, kdfIterations);

  const { user, vault } = await api<{ user: SessionUser; vault: { protectedVaultKey: string } }>("/auth/login", {
    method: "POST",
    body: { email, authKey },
  });
  setVaultKey(await unlockVaultKey(encKey, vault.protectedVaultKey));
  return user;
}

export async function signOut(): Promise<void> {
  clearVaultKey();
  await api("/auth/logout", { method: "POST" }).catch(() => {});
}

export function homeFor(user: SessionUser): string {
  return user.role === "admin" ? "/admin" : "/dashboard";
}

/** Re-derives the vault key from the password after a reload, without signing in again. */
export async function unlockVault(password: string): Promise<CryptoKey> {
  const { kdfSalt, kdfIterations, protectedVaultKey } = await api<{
    kdfSalt: string;
    kdfIterations: number;
    protectedVaultKey: string;
  }>("/vault/keys");
  const { encKey } = await deriveKeys(password, kdfSalt, kdfIterations);
  let key: CryptoKey;
  try {
    key = await unlockVaultKey(encKey, protectedVaultKey);
  } catch {
    throw new Error("Wrong password.");
  }
  setVaultKey(key);
  return key;
}
