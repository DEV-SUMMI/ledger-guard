import type { NextRequest, NextResponse } from "next/server";
import { newToken, sha256Hex } from "@/lib/crypto";
import { query } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { HttpError } from "@/lib/http";

const ABSOLUTE_TTL_MS = 12 * 60 * 60 * 1000;
const IDLE_TTL_MS = 2 * 60 * 60 * 1000;
const TOUCH_EVERY_MS = 5 * 60 * 1000;

export type Role = "user" | "admin";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

/** `__Host-` pins the cookie to our exact host over HTTPS; plain name for local http dev. */
function cookieName(): string {
  return getEnv().isProd ? "__Host-dv_session" : "dv_session";
}

export async function createSession(res: NextResponse, userId: string, ip: string, userAgent: string | null) {
  const token = newToken();
  await query(
    "INSERT INTO sessions (id, user_id, expires_at, ip, user_agent) VALUES ($1, $2, now() + $3 * interval '1 millisecond', $4, $5)",
    [sha256Hex(token), userId, ABSOLUTE_TTL_MS, ip, userAgent?.slice(0, 300) ?? null],
  );
  res.cookies.set(cookieName(), token, {
    httpOnly: true,
    secure: getEnv().isProd,
    sameSite: "strict",
    path: "/",
    maxAge: ABSOLUTE_TTL_MS / 1000,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(cookieName(), "", { httpOnly: true, secure: getEnv().isProd, sameSite: "strict", path: "/", maxAge: 0 });
}

export async function destroySession(req: NextRequest) {
  const token = req.cookies.get(cookieName())?.value;
  if (token) await query("DELETE FROM sessions WHERE id = $1", [sha256Hex(token)]);
}

/** Returns the signed-in, active user, or null. Expired and idle sessions don't count. */
export async function getSessionUser(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(cookieName())?.value;
  if (!token || token.length > 100) return null;

  const id = sha256Hex(token);
  const rows = await query<SessionUser & { last_seen_at: Date }>(
    `SELECT u.id, u.email, u.name, u.role, s.last_seen_at
       FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id = $1
        AND s.expires_at > now()
        AND s.last_seen_at > now() - $2 * interval '1 millisecond'
        AND u.status = 'active'`,
    [id, IDLE_TTL_MS],
  );
  const row = rows[0];
  if (!row) return null;

  if (Date.now() - row.last_seen_at.getTime() > TOUCH_EVERY_MS) {
    await query("UPDATE sessions SET last_seen_at = now() WHERE id = $1", [id]);
    await query("UPDATE users SET last_active_at = now() WHERE id = $1", [row.id]);
  }
  return { id: row.id, email: row.email, name: row.name, role: row.role };
}

export async function requireUser(req: NextRequest): Promise<SessionUser> {
  const user = await getSessionUser(req);
  if (!user) throw new HttpError(401, "Not signed in");
  return user;
}

export async function requireAdmin(req: NextRequest): Promise<SessionUser> {
  const user = await requireUser(req);
  if (user.role !== "admin") throw new HttpError(403, "Forbidden");
  return user;
}
