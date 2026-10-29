import type { StaticImageData } from "next/image";

export type CategoryId =
  | "seed"
  | "privatekey"
  | "apikey";

export interface Category {
  id: CategoryId;
  label: string;
  /** lucide icon name, resolved in the UI */
  icon: "folder-lock" | "key-round" | "key";
}

export interface WalletBrand {
  id: string;
  name: string;
  /** Default seed phrase length for this wallet */
  words: 12 | 18 | 24;
  /** Brand color as hex, used for the monogram fallback */
  color: string;
  /** Static image import from src/images; a monogram is shown when absent */
  logo?: StaticImageData;
}

export interface VaultItem {
  id: string;
  title: string;
  category: CategoryId;
  /** short non-secret hint shown on the card, e.g. which chain / exchange */
  hint: string;
  updated: string;
  favorite: boolean;
}

/** What gets encrypted for a key item (API or private key). Everything but the category is secret. */
export interface KeyItemContent {
  title: string;
  hint: string;
  secret: string;
  favorite: boolean;
}

/** A decrypted item from the member's vault. Plaintext lives in memory only. */
export interface KeyItem extends KeyItemContent {
  id: string;
  category: Exclude<CategoryId, "seed">;
  updatedAt: string;
}

/** A decrypted seed phrase, one per wallet. */
export interface SeedItem {
  id: string;
  walletId: string;
  words: string[];
  updatedAt: string;
}
