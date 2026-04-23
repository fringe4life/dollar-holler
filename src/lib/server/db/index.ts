import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { DATABASE_URL } from "$env/static/private";

// import { ENV } from "varlock/env";
import { tableRelations } from "./relations";
import { schemaTables } from "./schema";

neonConfig.webSocketConstructor = globalThis.WebSocket;
// Create the Pool client (WebSocket-based for transaction support)
const pool = new Pool({ connectionString: DATABASE_URL });

export const db = drizzle({
  client: pool,
  relations: tableRelations,
  schema: { ...schemaTables, ...tableRelations },
});
