import { json, route } from "@/lib/http";
import { requireUser } from "@/lib/session";

export const GET = route(async (req) => {
  const user = await requireUser(req);
  return json({ user });
});
