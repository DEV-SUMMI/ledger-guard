import { query } from "@/lib/db";
import { json, route } from "@/lib/http";

// Public so Railway's health check can reach it; reveals nothing beyond "up".
export const GET = route(
  async () => {
    await query("SELECT 1");
    return json({ ok: true });
  },
  { public: true },
);
