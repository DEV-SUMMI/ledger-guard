// Applies db/migrations/*.sql in order, once each. Safe to run on every deploy:
// an advisory lock stops two instances migrating at the same time.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectWithRetry } from "./connect.mjs";

const LOCK_ID = 727274;
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "db", "migrations");

const client = await connectWithRetry("migrate");
try {
  await client.query("SELECT pg_advisory_lock($1)", [LOCK_ID]);
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const { rows } = await client.query("SELECT name FROM schema_migrations");
  const applied = new Set(rows.map((r) => r.name));
  const files = (await readdir(dir)).filter((f) => f.endsWith(".sql")).sort();

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(path.join(dir, file), "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (name) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`migrate: applied ${file}`);
    } catch (err) {
      await client.query("ROLLBACK");
      throw new Error(`migrate: ${file} failed: ${err.message}`);
    }
  }
  console.log("migrate: up to date");
} finally {
  await client.query("SELECT pg_advisory_unlock($1)", [LOCK_ID]).catch(() => {});
  await client.end();
}
