import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { bearer, openAPI } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { ENV } from "varlock/env";
import { getRequestEvent } from "$app/server";
import { db } from "$lib/server/db/index";
import { schemaTables } from "$lib/server/db/schema";
import { createId } from "./server/utils/create-id";
export const auth = betterAuth({
  advanced: {
    database: {
      generateId: createId,
    },
  },
  allowedHosts: [
    "dollar-holler.vercel.app",
    "dollar-holler-*.vercel.app", // team preview pattern
    "localhost:*",
  ],
  appName: "Dollar Holler",
  basePath: "/api/auth",
  baseURL: ENV.PUBLIC_BASE_URL,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schemaTables,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  experimental: { joins: true },
  // Bearer: `Authorization: Bearer <token>` for APIs (OpenAPI "Try it", CLI, non-browser clients).
  // sveltekit must be the last plugin
  plugins: [openAPI(), bearer(), sveltekitCookies(getRequestEvent)],
  secret: ENV.BETTER_AUTH_SECRET,
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  trustedOrigins: [ENV.PUBLIC_BASE_URL],
});
