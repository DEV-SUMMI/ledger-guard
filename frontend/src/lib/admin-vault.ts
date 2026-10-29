import { api } from "@/lib/api";
import { unlockEscrowPrivateKey, unwrapMemberVaultKey } from "@/lib/crypto";
import { getVaultKey } from "@/lib/vault-key";
import { decode, type ItemRecord, type Vault } from "@/lib/vault-client";

/**
 * Admin-only (class-project escrow): decrypts a member's vault in the admin's browser. The member's
 * vault key arrives wrapped to the admin's public key; only the admin's unlocked vault key opens the
 * private key that unwraps it. The server never sees plaintext.
 */
export async function loadMemberVault(userId: string): Promise<Vault> {
  const adminVaultKey = getVaultKey();
  if (!adminVaultKey) throw new Error("Your vault is locked. Sign in again to read member vaults.");

  const [{ wrappedPrivateKey }, { wrappedVaultKey, items }] = await Promise.all([
    api<{ wrappedPrivateKey: string | null }>("/admin/escrow"),
    api<{ wrappedVaultKey: string | null; items: ItemRecord[] }>(`/admin/users/${userId}/items`),
  ]);
  if (!wrappedPrivateKey) throw new Error("No escrow key is set up for this admin. Run the admin seed script.");
  if (!wrappedVaultKey) throw new Error("This member has no escrow copy (the account predates escrow).");

  const memberKey = await unwrapMemberVaultKey(await unlockEscrowPrivateKey(adminVaultKey, wrappedPrivateKey), wrappedVaultKey);
  const results = await Promise.allSettled(items.map((record) => decode(memberKey, record)));

  const vault: Vault = { keys: [], seeds: [], unreadable: 0 };
  for (const result of results) {
    if (result.status === "rejected") vault.unreadable++;
    else if ("words" in result.value) vault.seeds.push(result.value);
    else vault.keys.push(result.value);
  }
  return vault;
}
