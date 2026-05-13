import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { DATABASE_URL } from "$env/static/private";
import { tableRelations } from "./relations";

neonConfig.webSocketConstructor = globalThis.WebSocket;
// Create the Pool client (WebSocket-based for transaction support)
const pool = new Pool({ connectionString: DATABASE_URL });

export const db = drizzle({
  client: pool,
  relations: tableRelations,
  jit: true,
});
