import { auth } from "$lib/auth";
import type { Session, User } from "better-auth";
import { Elysia } from "elysia";

/**
 * Better Auth plugin for ElysiaJS
 * Provides authentication macro that injects user and session into route context
 */
export const betterAuthPlugin = new Elysia({ name: "better-auth" })
  .mount(auth.handler)
  .macro({
    auth: {
      async resolve({ status, request: { headers } }) {
        const session = await auth.api.getSession({ headers });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

export type AuthContext = {
  user: User | null;
  session: Session | null;
};
