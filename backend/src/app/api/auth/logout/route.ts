import { audit } from "@/lib/audit";
import { clientIp, json, route } from "@/lib/http";
import { clearSessionCookie, destroySession, getSessionUser } from "@/lib/session";

export const POST = route(async (req) => {
  const user = await getSessionUser(req);
  await destroySession(req);
  if (user) await audit({ event: "Signed out", userId: user.id, actorEmail: user.email, ip: clientIp(req) });

  const res = json({ ok: true });
  clearSessionCookie(res);
  return res;
});
