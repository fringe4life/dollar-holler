import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { ENV } from "varlock/env";
import { tableRelations } from "./relations";

/** Short idle timeout so unused TCP conns close under Fluid Compute. */
const IDLE_TIMEOUT_MS = 30_000;

const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
  idleTimeoutMillis: IDLE_TIMEOUT_MS,
});

// Close idle clients before Fluid suspends the instance (no-op off Vercel).
attachDatabasePool(pool);

export const db = drizzle({
  client: pool,
  jit: true,
  relations: tableRelations,
});
