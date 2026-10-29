import { api } from "@/lib/api";
import { decryptJson, encryptJson } from "@/lib/crypto";
import type { CategoryId, KeyItem, KeyItemContent, SeedItem } from "@/types/vault";

/**
 * Vault items as the API sees them: a category, an optional wallet id and an opaque
 * ciphertext. Titles, hints and secrets are all inside the ciphertext.
 */
export interface ItemRecord {
  id: string;
  category: CategoryId;
  walletId: string | null;
  ciphertext: string;
  updatedAt: string;
}

/** Binds a payload to its category and wallet, so the server can't move it between them. */
function context(category: CategoryId, walletId: string | null) {
  return `digital-vault/item/v1/${category}/${walletId ?? ""}`;
}

export interface Vault {
  keys: KeyItem[];
  seeds: SeedItem[];
  /** Items that failed to decrypt (tampered with, or sealed with another key) */
  unreadable: number;
}

export async function decode(key: CryptoKey, record: ItemRecord): Promise<KeyItem | SeedItem> {
  const ctx = context(record.category, record.walletId);
  if (record.category === "seed") {
    const { words } = await decryptJson<{ words: string[] }>(key, record.ciphertext, ctx);
    return { id: record.id, walletId: record.walletId ?? "", words, updatedAt: record.updatedAt };
  }
  const content = await decryptJson<KeyItemContent>(key, record.ciphertext, ctx);
  return { ...content, id: record.id, category: record.category, updatedAt: record.updatedAt };
}

export async function loadVault(key: CryptoKey): Promise<Vault> {
  const { items } = await api<{ items: ItemRecord[] }>("/items");
  const results = await Promise.allSettled(items.map((record) => decode(key, record)));

  const vault: Vault = { keys: [], seeds: [], unreadable: 0 };
  for (const result of results) {
    if (result.status === "rejected") vault.unreadable++;
    else if ("words" in result.value) vault.seeds.push(result.value);
    else vault.keys.push(result.value);
  }
  return vault;
}

export async function createKeyItem(key: CryptoKey, category: KeyItem["category"], content: KeyItemContent): Promise<KeyItem> {
  const ciphertext = await encryptJson(key, content, context(category, null));
  const { item } = await api<{ item: ItemRecord }>("/items", { method: "POST", body: { category, ciphertext } });
  return { ...content, id: item.id, category, updatedAt: item.updatedAt };
}

export async function updateKeyItem(key: CryptoKey, item: KeyItem, content: KeyItemContent): Promise<KeyItem> {
  const ciphertext = await encryptJson(key, content, context(item.category, null));
  const { item: saved } = await api<{ item: ItemRecord }>(`/items/${item.id}`, { method: "PATCH", body: { ciphertext } });
  return { ...content, id: item.id, category: item.category, updatedAt: saved.updatedAt };
}

/** Creates or replaces the seed phrase for a wallet. */
export async function saveSeed(key: CryptoKey, walletId: string, words: string[], existing?: SeedItem): Promise<SeedItem> {
  const ciphertext = await encryptJson(key, { words }, context("seed", walletId));
  const { item } = existing
    ? await api<{ item: ItemRecord }>(`/items/${existing.id}`, { method: "PATCH", body: { ciphertext } })
    : await api<{ item: ItemRecord }>("/items", { method: "POST", body: { category: "seed", walletId, ciphertext } });
  return { id: item.id, walletId, words, updatedAt: item.updatedAt };
}

export async function deleteItem(id: string): Promise<void> {
  await api(`/items/${id}`, { method: "DELETE" });
}

/** Reveal and copy happen in the browser; tell the server so they show in the audit log. Best effort. */
export function reportAccess(event: "item.revealed" | "item.copied", itemId: string) {
  api("/audit", { method: "POST", body: { event, itemId } }).catch(() => {});
}
