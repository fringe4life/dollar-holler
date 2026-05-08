import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { bearer, openAPI } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { ENV } from "varlock/env";
import { getRequestEvent } from "$app/server";
import { createId } from "$features/pagination/utils/create-uuidv7.server";
import { db } from "$lib/server/db/index";
import { schemaTables } from "$lib/server/db/schema";
export const auth = betterAuth({
  appName: "Dollar Holler",
  baseURL: ENV.PUBLIC_BASE_URL,
  basePath: "/api/auth",
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schemaTables,
  }),
  secret: ENV.BETTER_AUTH_SECRET,
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
  // Bearer: `Authorization: Bearer <token>` for APIs (OpenAPI "Try it", CLI, non-browser clients).
  // sveltekit must be the last plugin
  plugins: [openAPI(), bearer(), sveltekitCookies(getRequestEvent)],
  advanced: {
    database: {
      generateId: createId,
    },
  },
});
