import type { Category, VaultItem } from "@/types/vault";

export const CATEGORIES: Category[] = [
  { id: "seed", label: "Connect Wallet", icon: "folder-lock" },
  { id: "privatekey", label: "Private keys", icon: "key-round" },
  { id: "apikey", label: "API keys", icon: "key" },
];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label]),
);

/** Placeholder entries for the landing page's AppDemo. The real dashboard loads the member's encrypted items. */
export const VAULT_ITEMS: VaultItem[] = [
  { id: "1", title: "Ledger — main seed backup", category: "seed", hint: "24 words · offline", updated: "2 days ago", favorite: true },
  { id: "2", title: "Cold wallet private key", category: "privatekey", hint: "Ethereum", updated: "1 week ago", favorite: true },
  { id: "3", title: "Binance read-only API", category: "apikey", hint: "Trading bot · read-only", updated: "3 days ago", favorite: false },
  { id: "5", title: "Hardware wallet #2", category: "privatekey", hint: "Bitcoin", updated: "2 weeks ago", favorite: false },
  { id: "7", title: "Coinbase API — portfolio sync", category: "apikey", hint: "Read-only", updated: "Yesterday", favorite: false },
  { id: "10", title: "Metamask recovery phrase", category: "seed", hint: "12 words", updated: "1 month ago", favorite: false },
];
