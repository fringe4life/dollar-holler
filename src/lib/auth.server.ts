import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { ENV } from "varlock/env";
import { getRequestEvent } from "$app/server";
import { db } from "#lib/server/db/index.ts";
import { schemaTables } from "#lib/server/db/schema.ts";
import { createId } from "./server/utils/create-id";
export const auth = betterAuth({
  advanced: {
    database: {
      generateId: createId,
      joins: true,
    },
  },
  allowedHosts: [
    "localhost:*",
    "*.workers.dev",
    "*.pages.dev",
    "dolla-holla.org",
  ],
  appName: "Dollar Holler",
  basePath: "/api/auth",
  baseURL: ENV.PUBLIC_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: schemaTables,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  // sveltekit must be the last plugin
  plugins: [sveltekitCookies(getRequestEvent)],
  secret: ENV.BETTER_AUTH_SECRET,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [ENV.PUBLIC_BASE_URL],
});
