import { json, route } from "@/lib/http";

// Public liveness probe for the host's health check. It deliberately never touches the
// database, so a sleeping or unreachable Postgres can't fail deploys or restart the service.
export const GET = route(async () => json({ status: "ok" }), { public: true });
