import { getRequestEvent } from "$app/server";
import { db } from "$lib/db/index";
import { schemaTables } from "$lib/db/schema";
import { createId } from "$lib/features/pagination/utils/create-uuidv7";
import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";
import { openAPI } from "better-auth/plugins";
import { sveltekitCookies } from "better-auth/svelte-kit";

import { ENV } from "varlock/env";
export const auth = betterAuth({
  appName: "Dollar Holler",
  baseURL: ENV.PUBLIC_BASE_URL,
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
  // sveltekit must be the last plugin
  plugins: [openAPI(), sveltekitCookies(getRequestEvent)],
  advanced: {
    database: {
      generateId: () => createId(),
    },
  },
});
