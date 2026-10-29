// Shared by the maintenance scripts: a pg client for DATABASE_URL, retried while the database starts up.
import pg from "pg";

// Errors that mean "wrong settings", not "not up yet" — retrying won't help.
const FATAL_CODES = new Set(["28P01", "28000", "3D000"]);

export async function connectWithRetry(name, attempts = 15) {
  if (!process.env.DATABASE_URL) {
    console.error(`${name}: DATABASE_URL is not set`);
    process.exit(1);
  }
  for (let i = 1; ; i++) {
    // A pg Client can't reconnect after a failed attempt, so each try gets a fresh one.
    const client = new pg.Client({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "require" ? { rejectUnauthorized: false } : undefined,
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
