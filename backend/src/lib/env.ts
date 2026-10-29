interface Env {
  databaseUrl: string;
  databaseSsl: boolean;
  /** Server-side secret for HMACs (min 32 chars) */
  appSecret: string;
  /** Shared secret the frontend proxy sends; empty disables the check (dev only) */
  internalToken: string;
  /** Origins allowed to make state-changing requests */
  allowedOrigins: string[];
  isProd: boolean;
}

let cached: Env | undefined;

/** Reads and validates configuration once, on first use (never at build time). */
export function getEnv(): Env {
  if (cached) return cached;

  const isProd = process.env.NODE_ENV === "production";
  const problems: string[] = [];

  const databaseUrl = process.env.DATABASE_URL ?? "";
  if (!databaseUrl) problems.push("DATABASE_URL is required");

  const appSecret = process.env.APP_SECRET ?? "";
  if (appSecret.length < 32) problems.push("APP_SECRET must be at least 32 characters");

  const internalToken = process.env.INTERNAL_API_TOKEN ?? "";
  if (isProd && internalToken.length < 32) problems.push("INTERNAL_API_TOKEN must be at least 32 characters in production");

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? (isProd ? "" : "http://localhost:3000"))
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);
  if (allowedOrigins.length === 0) problems.push("ALLOWED_ORIGINS is required (the frontend's public URL)");

  if (problems.length > 0) throw new Error(`Invalid configuration:\n- ${problems.join("\n- ")}`);

  cached = {
    databaseUrl,
    databaseSsl: process.env.DATABASE_SSL === "require",
    appSecret,
    internalToken,
    allowedOrigins,
    isProd,
  };
  return cached;
}
