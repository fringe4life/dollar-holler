import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { ENV } from "varlock/env";
import { tableRelations } from "./relations";

const client = createClient({
  authToken: ENV.TURSO_AUTH_TOKEN,
  url: ENV.TURSO_DATABASE_URL,
});

/**
 * Top-level await is fine for current deploy: Vercel + Node 24 (ESM) + SvelteKit SSR.
 * Revisit if runtime/bundler drops TLA support, or if we leave Node ESM (e.g. CJS-only
 * target). Also: `PRAGMA foreign_keys` is per-connection — if cascades look flaky under
 * remote Turso, set it in the same pipeline as writes, not only here at import.
 */
await client.execute("PRAGMA foreign_keys = ON");

export const db = drizzle({
  client,
  relations: tableRelations,
});
