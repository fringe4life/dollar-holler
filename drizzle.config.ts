/// <reference path="./src/env-varlock.d.ts" />
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/server/db/schema.ts",
  out: "./src/lib/server/db/migrations",
  verbose: true,
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
