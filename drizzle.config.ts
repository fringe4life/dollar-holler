import { defineConfig } from "drizzle-kit";
import { ENV } from "varlock/env";

export default defineConfig({
  dbCredentials: {
    authToken: ENV.TURSO_AUTH_TOKEN,
    url: ENV.TURSO_DATABASE_URL,
  },
  dialect: "turso",
  out: "./src/lib/server/db/migrations",
  schema: "./src/lib/server/db/schema.ts",
  strict: true,
  verbose: true,
});
