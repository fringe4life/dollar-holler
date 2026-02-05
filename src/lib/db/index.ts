import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { schemaTables, tableRelations } from "./schema";
// eslint-disable-next-line sonarjs/no-implicit-dependencies
import { DATABASE_URL } from "$env/static/private";

neonConfig.webSocketConstructor = globalThis.WebSocket;
// Create the Pool client (WebSocket-based for transaction support)
const pool = new Pool({ connectionString: DATABASE_URL });

// eslint-disable-next-line unicorn/prevent-abbreviations
export const db = drizzle({
  client: pool,
  relations: tableRelations,
  schema: { ...schemaTables, ...tableRelations },
});
