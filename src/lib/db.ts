import "server-only";
import { DatabaseSync } from "node:sqlite";
import path from "node:path";

// `server-only` makes the build fail if a Client Component ever imports this
// file, so the database (and anything secret next to it) can never leak into
// the browser bundle.

const globalForDb = globalThis as unknown as { ordersDb?: DatabaseSync };

export function getDb(): DatabaseSync {
  // Reuse one connection across hot reloads in development.
  if (!globalForDb.ordersDb) {
    const file = path.join(process.cwd(), "data", "orders.db");
    globalForDb.ordersDb = new DatabaseSync(file);
    globalForDb.ordersDb.exec("PRAGMA journal_mode = WAL;");
  }
  return globalForDb.ordersDb;
}
