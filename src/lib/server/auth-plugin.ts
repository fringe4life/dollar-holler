import { auth } from "$lib/auth";
import type { Maybe } from "$lib/types";
import type { Session, User } from "better-auth";
import { Elysia } from "elysia";

/**
 * Better Auth plugin for ElysiaJS
 * - `auth`: GET-safe; uses cookie cache when enabled (see auth config).
 * - `authMutation`: POST/PUT/PATCH/DELETE; bypasses cookie cache so the session is validated against the DB.
 *
 * **401 in route `response` schemas:** Unauthenticated requests are answered inside these macros with
 * `status(401, { message: "Unauthorized" })` before the route handler runs (see `resolve` in each macro
 * below). Handlers never emit 401 themselves. Protected routes should still declare
 * `401: apiErrorBodySchema` (or equivalent) on each endpoint using `auth` or `authMutation` so OpenAPI
 * and Elysia’s inferred response types include that status.
 */
export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) {
          return status(401, { message: "Unauthorized" });
        }
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
    authMutation: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({
          headers,
          query: { disableCookieCache: true },
        });
        if (!session) {
          return status(401, { message: "Unauthorized" });
        }
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

export type AuthContext = {
  user: Maybe<User>;
  session: Maybe<Session>;
};
