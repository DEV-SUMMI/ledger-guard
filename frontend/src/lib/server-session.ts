import { headers } from "next/headers";
import type { SessionUser } from "@/types/auth";

/**
 * Looks up the signed-in user for a server-rendered page by forwarding the
 * request's cookies to the API. Returns null when signed out or unreachable.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const backend = process.env.BACKEND_URL;
  const cookie = (await headers()).get("cookie");
  if (!backend || !cookie) return null;

  try {
    const res = await fetch(new URL("/api/auth/me", backend), {
      headers: { cookie, "x-internal-token": process.env.INTERNAL_API_TOKEN ?? "" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { user: SessionUser };
    return data.user;
  } catch {
    return null;
  }
}
