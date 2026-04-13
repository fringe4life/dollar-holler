import { getRequestEvent } from "$app/server";
import { BETTER_AUTH_SECRET } from "$env/static/private";
import { PUBLIC_BASE_URL } from "$env/static/public";
import { db } from "$lib/db/index";
import { schemaTables } from "$lib/db/schema";
import { createId } from "$lib/features/pagination/utils/create-uuidv7";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { openAPI } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";

export const auth = betterAuth({
  appName: "Dollar Holler",
  baseURL: PUBLIC_BASE_URL,
  trustedOrigins: [PUBLIC_BASE_URL],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schemaTables,
  }),
  secret: BETTER_AUTH_SECRET,
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
  // sveltekit must be the last plugin
  plugins: [openAPI(), sveltekitCookies(getRequestEvent)],
  advanced: {
    database: {
      generateId: () => createId(),
    },
  },
});
