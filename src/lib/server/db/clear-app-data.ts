/**
 * Removes all rows from app tables (clients, invoices, line_items, settings).
 * Better Auth tables (`user`, `session`, `account`, `verification`) are left intact.
 */
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { ENV } from "varlock/env";
import { tableRelations } from "./relations";
import { clients, invoices, lineItems, settings } from "./schema";

neonConfig.webSocketConstructor = globalThis.WebSocket;
const pool = new Pool({ connectionString: ENV.DATABASE_URL });

const db = drizzle({
  client: pool,
  relations: tableRelations,
});

async function main() {
  console.log(
    "Clearing app tables (line_items → invoices → clients → settings)…"
  );
  await db.delete(lineItems);
  await db.delete(invoices);
  await db.delete(clients);
  await db.delete(settings);
  console.log(
    "Done. Better Auth tables (user, session, account, verification) were not modified."
  );
  await pool.end();
}

main().catch((err) => {
  console.error("Clear failed:", err);
  process.exit(1);
});
