import { getRequestEvent } from "$app/server";
import { PUBLIC_BASE_URL } from "$env/static/public";
import { db } from "$lib/db";
import { schemaTables } from "$lib/db/schema";
import { createId } from "@paralleldrive/cuid2";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { sveltekitCookies } from "better-auth/svelte-kit";

export const auth = betterAuth({
  appName: "Dollar Holler",
  baseURL: PUBLIC_BASE_URL,
  trustedOrigins: [
    PUBLIC_BASE_URL,
    "http://localhost:4173",
    "http://localhost:5173",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schemaTables,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  plugins: [sveltekitCookies(getRequestEvent)],

  databaseHooks: {
    user: {
      create: {
        // eslint-disable-next-line @typescript-eslint/require-await, sonarjs/arrow-function-convention
        before: async (user) => ({
          data: {
            ...user,
            id: createId(),
          },
        }),
      },
    },
  },
});
