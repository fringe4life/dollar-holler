import { defineConfig } from "drizzle-kit";
import { ENV } from "varlock/env";

const d1Http =
  ENV.CLOUDFLARE_ACCOUNT_ID &&
  ENV.CLOUDFLARE_D1_DATABASE_ID &&
  ENV.CLOUDFLARE_API_TOKEN
    ? {
        dbCredentials: {
          accountId: ENV.CLOUDFLARE_ACCOUNT_ID,
          databaseId: ENV.CLOUDFLARE_D1_DATABASE_ID,
          token: ENV.CLOUDFLARE_API_TOKEN,
        },
        driver: "d1-http" as const,
      }
    : {};

export default defineConfig({
  dialect: "sqlite",
  out: "./src/lib/server/db/migrations",
  schema: "./src/lib/server/db/schema.ts",
  strict: true,
  verbose: true,
  ...d1Http,
});
