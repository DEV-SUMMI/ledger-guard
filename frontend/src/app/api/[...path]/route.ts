import type { NextRequest } from "next/server";

/**
 * Forwards /api/* to the backend over the private network. The browser only ever talks
 * to this origin, so session cookies stay first-party and the backend needs no public URL.
 */

const FORWARD_HEADERS = ["accept", "content-type", "cookie", "origin", "user-agent"];
const RETURN_HEADERS = ["content-type", "cache-control"];
const MAX_BODY_BYTES = 128 * 1024;

type Ctx = { params: Promise<{ path: string[] }> };

async function proxy(req: NextRequest, ctx: Ctx): Promise<Response> {
  const backend = process.env.BACKEND_URL;
  if (!backend) return Response.json({ error: "API is not configured" }, { status: 503 });

  const { path } = await ctx.params;
  if (path.some((seg) => seg === "." || seg === "..")) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  const target = new URL(`/api/${path.map(encodeURIComponent).join("/")}${req.nextUrl.search}`, backend);

  const headers = new Headers();
  for (const name of FORWARD_HEADERS) {
    const value = req.headers.get(name);
    if (value) headers.set(name, value);
  }
  // Railway's edge sets X-Real-IP / X-Forwarded-For; the first hop is the client.
  const ip = req.headers.get("x-real-ip") ?? req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (ip) headers.set("x-client-ip", ip);
  if (process.env.INTERNAL_API_TOKEN) headers.set("x-internal-token", process.env.INTERNAL_API_TOKEN);

  let body: ArrayBuffer | undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await req.arrayBuffer();
    if (body.byteLength > MAX_BODY_BYTES) return Response.json({ error: "Request too large" }, { status: 413 });
  }

  let res: Response;
  try {
    res = await fetch(target, { method: req.method, headers, body, redirect: "manual", cache: "no-store" });
  } catch {
    return Response.json({ error: "API is unavailable" }, { status: 502 });
  }

  const out = new Headers({ "Cache-Control": "no-store" });
  for (const name of RETURN_HEADERS) {
    const value = res.headers.get(name);
    if (value) out.set(name, value);
  }
  for (const cookie of res.headers.getSetCookie()) out.append("set-cookie", cookie);

  return new Response(res.body, { status: res.status, headers: out });
}

export { proxy as DELETE, proxy as GET, proxy as PATCH, proxy as POST, proxy as PUT };
