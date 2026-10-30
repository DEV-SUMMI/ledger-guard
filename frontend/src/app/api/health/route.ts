// Liveness probe for the host's health check. Takes precedence over the /api/[...path]
// proxy, so it answers without waking the backend or the database.
export function GET(): Response {
  return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
