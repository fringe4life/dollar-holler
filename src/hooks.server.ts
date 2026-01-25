import { building } from "$app/environment";
import { auth } from "$lib/auth";
import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";

export const localsHandler: Handle = async ({ event, resolve }) => {
  const session = await auth.api.getSession({
    headers: event.request.headers,
  });
  if (session) {
    event.locals.session = session.session;
    event.locals.user = session.user;
  }
  return resolve(event);
};

// auth handler for better auth routes and to populate locals
export const authHandler: Handle = async ({ event, resolve }) => {
  return svelteKitHandler({
    event,
    resolve,
    auth,
    building,
  });
};

const PROTECTED_ROUTES = ["/invoices", "/clients", "/settings"];

const UNPROTECTED_ROUTES = ["/login", "/signup"];

// Auth guard for protected routes
export const authGuard: Handle = async ({ event, resolve }) => {
  const path = event.url.pathname;
  // if not logged in and attempting to access protected routes, redirect to login
  if (!event.locals.session) {
    if (PROTECTED_ROUTES.some((route) => path.startsWith(route))) {
      throw redirect(303, "/login");
    }
  }

  // if logged in an attempting to access login or signup, redirect to invoices
  if (
    event.locals.session &&
    UNPROTECTED_ROUTES.some((route) => path.startsWith(route))
  ) {
    throw redirect(303, "/invoices");
  }

  return resolve(event);
};

export const handle: Handle = sequence(authHandler, localsHandler, authGuard);
