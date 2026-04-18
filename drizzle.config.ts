/// <reference path="./src/env-varlock.d.ts" />
import { defineConfig } from "drizzle-kit";
import { ENV } from "varlock/env";
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  verbose: true,
  strict: true,
  dbCredentials: {
    url: ENV.DATABASE_URL,
  },
});
