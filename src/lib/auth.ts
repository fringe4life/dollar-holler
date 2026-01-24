import { getRequestEvent } from "$app/server";
import { db } from "$lib/db";
import { createId } from "@paralleldrive/cuid2";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import { sveltekitCookies } from "better-auth/svelte-kit";

export const auth = betterAuth({
  appName: "Dollar Holler",
  baseURL: process.env.PUBLIC_BASE_URL || "http://localhost:5173",
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
  }),
  experimental: {
    joins: true,
  },
  secret: process.env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
    },
  },
  plugins: [sveltekitCookies(getRequestEvent)],
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:4173",
    process.env.PUBLIC_BASE_URL,
  ].filter(Boolean) as string[],
  databaseHooks: {
    user: {
      create: {
        before: async (user, _) => {
          // Generate CUID2 for user ID
          return {
            data: {
              ...user,
              id: createId(),
            },
          };
        },
      },
    },
  },
});
