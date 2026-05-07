import { type Handle, redirect } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { auth } from "$lib/auth.server";
import { tryCatch } from "$lib/utils/try-catch";

// get session from better auth and populate locals
const localsHandler: Handle = async ({ event, resolve }) => {
  const { data: result } = await tryCatch(() =>
    auth.api.getSession({
      headers: event.request.headers,
    })
  );
  if (result) {
    event.locals.user = result.user;
  }
  return resolve(event);
};

// auth handler for better auth routes
const authHandler: Handle = async ({ event, resolve }) =>
  svelteKitHandler({
    event,
    resolve,
    auth,
    building,
  });

const PROTECTED_ROUTES = ["/invoices", "/clients", "/settings"];

const UNPROTECTED_ROUTES = ["/login", "/signup"];

// Auth guard for protected routes
const authGuard: Handle = ({ event, resolve }) => {
  const path = event.url.pathname;
  // if not logged in and attempting to access protected routes, redirect to login
  if (
    !event.locals.user &&
    PROTECTED_ROUTES.some((route) => path.startsWith(route))
  ) {
    throw redirect(303, "/login");
  }

  // if logged in an attempting to access login or signup, redirect to invoices
  if (
    event.locals.user &&
    UNPROTECTED_ROUTES.some((route) => path.startsWith(route))
  ) {
    throw redirect(303, "/invoices");
  }

  return resolve(event);
};

/** Preload self-hosted fonts from bundled CSS (not invoked in vite dev). */
const fontPreloadHandler: Handle = async ({ event, resolve }) =>
  resolve(event, {
    preload: ({ type }) => type === "js" || type === "css" || type === "font",
  });

export const handle: Handle = sequence(
  localsHandler,
  authHandler,
  authGuard,
  fontPreloadHandler
);
