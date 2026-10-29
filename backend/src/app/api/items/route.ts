import { audit } from "@/lib/audit";
import { isPgError, UNIQUE_VIOLATION, withUser } from "@/lib/db";
import { clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { ITEM_COLUMNS, MAX_ITEMS_PER_USER, type ItemRow } from "@/lib/items";
import { requireUser } from "@/lib/session";
import { createItemSchema } from "@/lib/validation";

export const GET = route(async (req) => {
  const user = await requireUser(req);
  const items = await withUser(user.id, async (db) => {
    const { rows } = await db.query<ItemRow>(
      `SELECT ${ITEM_COLUMNS} FROM vault_items WHERE owner_id = $1 ORDER BY updated_at DESC`,
      [user.id],
    );
    return rows;
  });
  return json({ items });
});

export const POST = route(async (req) => {
  const user = await requireUser(req);
  const body = await readJson(req, createItemSchema);

  try {
    const item = await withUser(user.id, async (db) => {
      const { rows: count } = await db.query<{ n: number }>(
        "SELECT count(*)::int AS n FROM vault_items WHERE owner_id = $1",
        [user.id],
      );
      if (count[0].n >= MAX_ITEMS_PER_USER) throw new HttpError(409, "Vault item limit reached");

      const { rows } = await db.query<ItemRow>(
        `INSERT INTO vault_items (owner_id, category, wallet_id, ciphertext)
         VALUES ($1, $2, $3, $4) RETURNING ${ITEM_COLUMNS}`,
        [user.id, body.category, body.walletId ?? null, body.ciphertext],
      );
      return rows[0];
    });

    await audit({ event: "Item created", userId: user.id, actorEmail: user.email, detail: body.category, ip: clientIp(req) });
    return json({ item }, 201);
  } catch (err) {
    if (isPgError(err, UNIQUE_VIOLATION)) throw new HttpError(409, "A seed phrase for this wallet already exists");
    throw err;
  }
});
