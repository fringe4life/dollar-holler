import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  dialect: "postgresql",
  out: "./src/lib/server/db/migrations",
  schema: "./src/lib/server/db/schema.ts",
  strict: true,
  verbose: true,
});
