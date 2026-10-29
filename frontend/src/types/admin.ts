import type { Role } from "@/types/auth";

export type UserStatus = "active" | "suspended";

/** Account information from /api/admin/users. Vault contents are only readable via admin key escrow (see admin-vault.ts). */
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: UserStatus;
  items: number;
  createdAt: string;
  lastActiveAt: string | null;
}

/** Single-account detail from /api/admin/users/:id. The profile note is an openly
 *  admin-visible, non-secret field the member sets themselves — not vault contents. */
export interface AdminUserDetail extends AdminUser {
  profileNote: string;
}

export interface AdminMetrics {
  totals: { users: number; active: number; suspended: number; items: number; activeToday: number };
  /** Sign-ups per day for the last 14 days, oldest first */
  signups: { day: string; count: number }[];
}

export type AuditLevel = "info" | "warning" | "critical";

export interface AuditEvent {
  id: string;
  level: AuditLevel;
  event: string;
  actor: string | null;
  detail: string | null;
  ip: string | null;
  createdAt: string;
}

export type AdminTab = "overview" | "users" | "audit";
