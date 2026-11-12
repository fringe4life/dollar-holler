import { redirect } from "@sveltejs/kit";
import {
  type Handle,
  type HandleServerError,
  sequence,
} from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/env";
import { getAuth } from "#lib/auth.server.ts";
import { tryGetD1 } from "#lib/server/db/index.ts";
import { shouldPreloadAsset } from "#lib/fonts/preload.ts";
import { THEME_COOKIE_NAME, parseStoredTheme } from "#lib/theme/schema.ts";
import { stampHtmlTheme } from "#lib/theme/theme.ts";
import { handle as ogygiaHandle } from "ogygia/server";

// get session from better auth and populate locals
const localsHandler: Handle = async ({ event, resolve }) => {
  if (building || !tryGetD1()) {
    return resolve(event);
  }

  const auth = getAuth();
  const result = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (result?.user) {
    event.locals.user = result.user;
  }

  // svelteKitHandler's isAuthPath compares request origin to string baseURL.
  // Alchemy/Vite listen on 127.0.0.1 while PUBLIC_BASE_URL is localhost
  // (and production Host is dolla-holla.org). Dispatch by path so Host
  // twins still hit Better Auth instead of a Kit HTML 404.
  if (event.url.pathname.startsWith("/api/auth")) {
    return auth.handler(event.request);
  }

  return svelteKitHandler({
    auth,
    building,
    event,
    resolve,
  });
};

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

  // Logged-in visitors hitting /login or /signup: this branch only runs when the
  // request hits the worker (not prerendered static assets). Prerendered auth
  // shells use AuthEntryGuard (deferred island) for the same redirect.
  if (
    event.locals.user &&
    UNPROTECTED_ROUTES.some((route) => path.startsWith(route))
  ) {
    throw redirect(303, "/invoices");
  }

  return resolve(event);
};

/** Stamp `data-theme` on `<html>` when the theme cookie is set. */
const themeHandler: Handle = ({ event, resolve }) => {
  const stored = building
    ? null
    : parseStoredTheme(event.cookies.get(THEME_COOKIE_NAME));

  return resolve(event, {
    transformPageChunk: ({ html }) => stampHtmlTheme(html, stored),
  });
};

/**
 * Preload JS, CSS, and webfonts that this route will paint.
 * Matrix and filename matching live in `#lib/fonts/preload.ts`.
 */
const fontPreloadHandler: Handle = async ({ event, resolve }) =>
  resolve(event, {
    preload: (input) => shouldPreloadAsset(input, event.url.pathname),
  });

// Order: session/locals before auth; preload last on resolve.
// ogygia is last so /__ogygia__ still receives the session and theme cookie, then serves the island.
export const handle: Handle = sequence(
  localsHandler,
  authGuard,
  themeHandler,
  fontPreloadHandler,
  ogygiaHandle()
);

/** Cloudflare Issues groups `console.error` / uncaught / Worker 5xx. */
export const handleError: HandleServerError = ({ error }) => {
  console.error(error);
};
