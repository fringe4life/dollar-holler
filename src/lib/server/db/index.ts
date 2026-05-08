import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import { ENV } from "varlock/env";
import { tableRelations } from "./relations";

neonConfig.webSocketConstructor = globalThis.WebSocket;
// Create the Pool client (WebSocket-based for transaction support)
const pool = new Pool({ connectionString: ENV.DATABASE_URL });

export const db = drizzle({
  client: pool,
  relations: tableRelations,
  jit: true,
});
