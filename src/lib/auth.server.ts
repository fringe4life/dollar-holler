import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2";
import { betterAuth } from "better-auth/minimal";
import { sveltekitCookies } from "better-auth/svelte-kit";
import { Context, Effect, Layer, ManagedRuntime, Redacted } from "effect";
import { getRequestEvent } from "$app/server";
import { db } from "#lib/server/db/index.ts";
import { schemaTables } from "#lib/server/db/schema.ts";
import { Env } from "#lib/server/effect/env.ts";
import { createId } from "./server/utils/create-id";

/**
 * `alchemy dev` / Vite listen on `127.0.0.1` while `PUBLIC_BASE_URL` is
 * typically `http://localhost:5173`. Better Auth keys `/api/auth` off the
 * Host header, so the IP twin must be allowed or those routes 404.
 */
export const loopbackTwinOrigin = (baseURL: string): string | undefined => {
  try {
    const url = new URL(baseURL);
    if (url.hostname === "localhost") {
      url.hostname = "127.0.0.1";
      return url.origin;
    }
    if (url.hostname === "127.0.0.1") {
      url.hostname = "localhost";
      return url.origin;
    }
  } catch {
    return undefined;
  }
};

/**
 * Better Auth instance. Built on first use, then cached for the isolate.
 * `drizzleAdapter` reads `db._` at construct, and `db` reads `env.DB`, so
 * this must not run at module import.
 */
const createAuth = (env: {
  PUBLIC_BASE_URL: string;
  BETTER_AUTH_SECRET: Redacted.Redacted<string>;
}) => {
  const twinOrigin = loopbackTwinOrigin(env.PUBLIC_BASE_URL);
  return betterAuth({
    advanced: {
      database: {
        generateId: createId,
        joins: true,
      },
    },
    allowedHosts: [
      "localhost:*",
      "127.0.0.1:*",
      "*.workers.dev",
      "*.pages.dev",
      "dolla-holla.org",
    ],
    appName: "Dollar Holler",
    basePath: "/api/auth",
    // String fallback for cookies; allowedHosts covers Host. svelteKitHandler
    // still compares request origin to this string, so hooks dispatch `/api/auth`.
    baseURL: env.PUBLIC_BASE_URL,
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
    secret: Redacted.value(env.BETTER_AUTH_SECRET),
    session: {
      cookieCache: {
        enabled: true,
        maxAge: 5 * 60,
      },
    },
    trustedOrigins: [
      ...new Set([
        env.PUBLIC_BASE_URL,
        "https://dolla-holla.org",
        ...(twinOrigin === undefined ? [] : [twinOrigin]),
      ]),
    ],
  });
};

type AuthInstance = ReturnType<typeof createAuth>;

/**
 * Same Better Auth instance the Kit routes already call. Not
 * `@alchemy.run/better-auth` and not a second Worker.
 */
export class Auth extends Context.Service<Auth, AuthInstance>()(
  "dollar-holler/Auth"
) {
  static readonly layer = Layer.effect(
    Auth,
    Effect.gen(function* () {
      const env = yield* Env;
      return createAuth(env);
    })
  );
}

const authRuntime = ManagedRuntime.make(
  Auth.layer.pipe(Layer.provide(Env.layer))
);

/**
 * Isolate-cached Better Auth. `ManagedRuntime` memoizes the layer, which is
 * the same one-instance-per-isolate cache as the old `instance ??=` assignment.
 * `Env` reads process env synchronously, so `runSync` is enough.
 */
export const getAuth = (): AuthInstance =>
  authRuntime.runSync(
    Effect.gen(function* () {
      return yield* Auth;
    })
  );
