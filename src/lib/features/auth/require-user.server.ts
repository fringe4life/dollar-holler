import { error } from "@sveltejs/kit";
import { getRequestEvent } from "$app/server";
import { auth } from "#lib/auth.server";

/** Session from hooks (`locals.user`). Use for `query`. */
export const requireUser = () => {
  const { locals } = getRequestEvent();
  if (!locals.user) {
    error(401, "Unauthorized");
  }
  return locals.user;
};

/** Fresh DB session (cookie cache off). Use for `command` / `form` writes. */
export const requireUserMutation = async () => {
  const { request } = getRequestEvent();
  const session = await auth.api.getSession({
    headers: request.headers,
    query: { disableCookieCache: true },
  });
  if (!session?.user) {
    error(401, "Unauthorized");
  }
  return session.user;
};
