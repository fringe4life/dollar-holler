/// <reference path="./src/env-varlock.d.ts" />
import { defineConfig } from "drizzle-kit";
// @ts-expect-error No types for process.env
const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error(
    "DATABASE_URL is not set. Run Drizzle via `varlock run` (e.g. `bun run db:push`)."
  );
}
// use url in dbCredentials.url
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  verbose: true,
  strict: true,
  dbCredentials: {
    url,
  },
});
