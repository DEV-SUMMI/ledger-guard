export interface ItemRow {
  id: string;
  category: string;
  walletId: string | null;
  ciphertext: string;
  createdAt: Date;
  updatedAt: Date;
}

export const ITEM_COLUMNS =
  'id, category, wallet_id AS "walletId", ciphertext, created_at AS "createdAt", updated_at AS "updatedAt"';

export const MAX_ITEMS_PER_USER = 1000;
