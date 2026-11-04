import { z } from "zod";

const base64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** AES-GCM payload produced in the browser: v1.<iv>.<ciphertext>, all base64 */
const sealed = z
  .string()
  .max(20_000)
  .regex(/^v1\.[A-Za-z0-9+/]{16}\.[A-Za-z0-9+/]+={0,2}$/, "Invalid encrypted payload");

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .max(254)
  .pipe(z.email());

/** Base64 of the 32-byte auth key the browser derives from the password */
const authKey = z.string().length(44).regex(base64);

export const preloginSchema = z.object({ email });

export const loginSchema = z.object({ email, authKey });

export const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email,
  authKey,
  kdfSalt: z.string().min(22).max(88).regex(base64),
  kdfIterations: z.int().min(600_000).max(5_000_000),
  protectedVaultKey: sealed,
  /** Vault key wrapped to the admin's public key (RSA-OAEP, base64); absent if no admin key is published */
  adminWrappedVaultKey: z.string().max(2_000).regex(base64).optional(),
});

export const categorySchema = z.enum(["seed", "privatekey", "apikey"]);

export const createItemSchema = z
  .object({
    category: categorySchema,
    walletId: z.string().regex(/^[a-z0-9-]{1,40}$/).optional(),
    ciphertext: sealed,
  })
  .refine((v) => v.category === "seed" || v.walletId === undefined, { message: "walletId is only for seed phrases" });

export const updateItemSchema = z.object({ ciphertext: sealed });

export const clientAuditSchema = z.object({
  event: z.enum(["item.revealed", "item.copied"]),
  itemId: z.uuid(),
});

export const userStatusSchema = z.object({ status: z.enum(["active", "suspended"]) });

/** The member's own non-secret, admin-visible profile note. Plaintext by design. */
export const profileSchema = z.object({ profileNote: z.string().max(500) });

export const uuidParam = z.uuid();

/** Admin balance change: a positive dollar amount (max 2 decimals) to add or subtract. */
export const balanceAdjustSchema = z.object({
  operation: z.enum(["increase", "decrease"]),
  amount: z
    .string()
    .regex(/^\d{1,9}(\.\d{1,2})?$/)
    .refine((v) => Number(v) > 0),
});

const dollarAmount = z
  .string()
  .regex(/^\d{1,9}(\.\d{1,2})?$/)
  .refine((v) => Number(v) > 0);

export const withdrawalCreateSchema = z.object({ amount: dollarAmount });

export const withdrawalResolveSchema = z.object({ status: z.enum(["fulfilled", "rejected"]) });
