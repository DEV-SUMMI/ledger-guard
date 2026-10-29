import { query } from "@/lib/db";

export type AuditLevel = "info" | "warning" | "critical";

interface AuditInput {
  event: string;
  level?: AuditLevel;
  userId?: string | null;
  actorEmail?: string | null;
  detail?: string;
  ip?: string;
}

/** Records a security event. Never throws: a logging failure must not break the request. */
export async function audit({ event, level = "info", userId = null, actorEmail = null, detail, ip }: AuditInput) {
  try {
    await query(
      "INSERT INTO audit_events (user_id, actor_email, level, event, detail, ip) VALUES ($1, $2, $3, $4, $5, $6)",
      [userId, actorEmail?.slice(0, 254) ?? null, level, event, detail?.slice(0, 500) ?? null, ip ?? null],
    );
  } catch (err) {
    console.error("audit: failed to record event", event, err);
  }
}
