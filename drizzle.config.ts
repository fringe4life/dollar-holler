import { defineConfig } from "drizzle-kit";
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Define it in .env and run Drizzle via Bun so .env is loaded (e.g. bun run db:push)."
  );
}

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  verbose: true,
  strict: true,
  dbCredentials: {
    url: databaseUrl,
  },
});
