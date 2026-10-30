// Shared by the maintenance scripts: a pg client for DATABASE_URL, retried while the database starts up.
// DATABASE_URL_UNPOOLED, when set, wins: migrations take a session-level advisory lock, which a
// transaction-mode pooler (e.g. Neon's -pooler host) doesn't keep on one server connection.
import pg from "pg";

// Errors that mean "wrong settings", not "not up yet" — retrying won't help.
const FATAL_CODES = new Set(["28P01", "28000", "3D000"]);

export async function connectWithRetry(name, attempts = 15) {
  const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(`${name}: DATABASE_URL is not set`);
    process.exit(1);
  }
  for (let i = 1; ; i++) {
    // A pg Client can't reconnect after a failed attempt, so each try gets a fresh one.
    const client = new pg.Client({
      connectionString,
      ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined,
      // Without this an unroutable host hangs each attempt for the OS TCP timeout
      connectionTimeoutMillis: 10_000,
    });
    try {
      await client.connect();
      return client;
    } catch (err) {
      await client.end().catch(() => {});
      if (i >= attempts || FATAL_CODES.has(err.code)) throw err;
      console.log(`${name}: database not ready (${err.code ?? err.message}), retrying…`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}
