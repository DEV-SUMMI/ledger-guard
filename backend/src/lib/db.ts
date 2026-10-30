import { Pool, type PoolClient, type QueryResultRow } from "pg";
import { getEnv } from "@/lib/env";

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    const env = getEnv();
    pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: env.databaseSsl ? { rejectUnauthorized: false } : undefined,
      // Small pool: a managed pooler (e.g. Neon's PgBouncer endpoint) multiplexes behind it
      max: 5,
      idleTimeoutMillis: 30_000,
      // Fail instead of piling up requests if the database is unreachable; long enough
      // for a serverless Postgres to wake from suspend
      connectionTimeoutMillis: 10_000,
      statement_timeout: 10_000,
    });
  }
  return pool;
}

/**
 * Runs a query as the connection owner. Use only for auth, sessions, audit and admin
 * aggregates — never to read vault item contents (use `withUser` for that).
 */
export async function query<T extends QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query<T>(text, params);
  return result.rows;
}

/**
 * Runs `fn` in a transaction as the restricted `vault_app` role with row-level security
 * scoped to `userId`, so a query can only ever see or change that member's vault items.
 */
export async function withUser<T>(userId: string, fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL ROLE vault_app");
    await client.query("SELECT set_config('app.user_id', $1, true)", [userId]);
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  } finally {
    client.release();
  }
}

/** Postgres unique-violation error code */
export const UNIQUE_VIOLATION = "23505";

export function isPgError(err: unknown, code: string): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === code;
}
