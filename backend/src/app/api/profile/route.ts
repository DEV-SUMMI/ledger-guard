import { query } from "@/lib/db";
import { json, readJson, route } from "@/lib/http";
import { requireUser } from "@/lib/session";
import { profileSchema } from "@/lib/validation";

/**
 * The member's own editable profile fields. These are stored in plaintext and are
 * openly admin-visible (see the dashboard disclosure) — they are NOT vault contents.
 */
export const GET = route(async (req) => {
  const user = await requireUser(req);
  const rows = await query<{ profileNote: string }>(
    `SELECT profile_note AS "profileNote" FROM users WHERE id = $1`,
    [user.id],
  );
  return json({ profileNote: rows[0]?.profileNote ?? "" });
});

export const PATCH = route(async (req) => {
  const user = await requireUser(req);
  const { profileNote } = await readJson(req, profileSchema);
  await query("UPDATE users SET profile_note = $2 WHERE id = $1", [user.id, profileNote]);
  return json({ ok: true });
});
