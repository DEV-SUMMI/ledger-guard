import { audit } from "@/lib/audit";
import { withUser } from "@/lib/db";
import { clientIp, HttpError, json, readJson, route } from "@/lib/http";
import { ITEM_COLUMNS, type ItemRow } from "@/lib/items";
import { requireUser } from "@/lib/session";
import { updateItemSchema, uuidParam } from "@/lib/validation";

interface Ctx {
  params: Promise<{ id: string }>;
}

async function itemId(ctx: Ctx): Promise<string> {
  const parsed = uuidParam.safeParse((await ctx.params).id);
  // Malformed ids look exactly like missing ones.
  if (!parsed.success) throw new HttpError(404, "Item not found");
  return parsed.data;
}

export const PATCH = route<Ctx>(async (req, ctx) => {
  const user = await requireUser(req);
  const id = await itemId(ctx);
  const { ciphertext } = await readJson(req, updateItemSchema);

  const item = await withUser(user.id, async (db) => {
    const { rows } = await db.query<ItemRow>(
      `UPDATE vault_items SET ciphertext = $3, updated_at = now()
        WHERE id = $1 AND owner_id = $2 RETURNING ${ITEM_COLUMNS}`,
      [id, user.id, ciphertext],
    );
    return rows[0];
  });
  if (!item) throw new HttpError(404, "Item not found");

  await audit({ event: "Item updated", userId: user.id, actorEmail: user.email, detail: item.category, ip: clientIp(req) });
  return json({ item });
});

export const DELETE = route<Ctx>(async (req, ctx) => {
  const user = await requireUser(req);
  const id = await itemId(ctx);

  const deleted = await withUser(user.id, async (db) => {
    const { rows } = await db.query<{ category: string }>(
      "DELETE FROM vault_items WHERE id = $1 AND owner_id = $2 RETURNING category",
      [id, user.id],
    );
    return rows[0];
  });
  if (!deleted) throw new HttpError(404, "Item not found");

  await audit({ event: "Item deleted", level: "warning", userId: user.id, actorEmail: user.email, detail: deleted.category, ip: clientIp(req) });
  return json({ ok: true });
});
