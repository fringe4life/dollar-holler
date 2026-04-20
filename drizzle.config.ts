/// <reference path="./src/env-varlock.d.ts" />
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./src/lib/db/migrations",
  verbose: true,
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
