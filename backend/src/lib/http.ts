import { NextResponse, type NextRequest } from "next/server";
import { ZodError, type ZodType } from "zod";
import { safeEqual } from "@/lib/crypto";
import { getEnv } from "@/lib/env";

const MAX_BODY_BYTES = 64 * 1024;
const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function json(data: unknown, status = 200): NextResponse {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

type Handler<C> = (req: NextRequest, ctx: C) => Promise<Response>;

/**
 * Wraps every route: checks the request came through our frontend proxy, blocks
 * cross-site writes, and turns thrown errors into safe JSON responses.
 */
export function route<C>(fn: Handler<C>, opts: { public?: boolean } = {}): Handler<C> {
  return async (req, ctx) => {
    try {
      const env = getEnv();

      if (!opts.public && env.internalToken) {
        const token = req.headers.get("x-internal-token") ?? "";
        if (!safeEqual(token, env.internalToken)) throw new HttpError(401, "Unauthorized");
      }

      if (UNSAFE_METHODS.has(req.method)) {
        // CSRF: browsers always send Origin on cross-site writes; reject anything not ours.
        const origin = req.headers.get("origin");
        if (!origin || !env.allowedOrigins.includes(origin)) throw new HttpError(403, "Forbidden");
        // Plain HTML forms can't send JSON, which closes off the remaining CSRF vectors.
        if (req.method !== "DELETE" && !req.headers.get("content-type")?.startsWith("application/json")) {
          throw new HttpError(415, "Expected application/json");
        }
      }

      return await fn(req, ctx);
    } catch (err) {
      if (err instanceof HttpError) return json({ error: err.message }, err.status);
      if (err instanceof ZodError) return json({ error: "Invalid request" }, 400);
      console.error(`[${req.method} ${req.nextUrl.pathname}]`, err);
      return json({ error: "Something went wrong" }, 500);
    }
  };
}

/** Reads and validates a JSON body, rejecting oversized or malformed input. */
export async function readJson<T>(req: NextRequest, schema: ZodType<T>): Promise<T> {
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) throw new HttpError(413, "Request too large");
  const text = await req.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) throw new HttpError(413, "Request too large");
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
  return schema.parse(data);
}

/**
 * The client's IP as reported by the frontend proxy. Only trustworthy because the
 * backend is reachable solely through that proxy (private network + internal token).
 */
export function clientIp(req: NextRequest): string {
  return (req.headers.get("x-client-ip") ?? "unknown").slice(0, 64);
}
