// biome-ignore lint/performance/noNamespaceImport: way to use sentry
import * as Sentry from "@sentry/sveltekit";
import { redirect } from "@sveltejs/kit";
import { type Handle, sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/env";
import { getAuth } from "#lib/auth.server.ts";
import { shouldPreloadAsset } from "#lib/fonts/preload.ts";
import { THEME_COOKIE_NAME, parseStoredTheme } from "#lib/theme/schema.ts";
import { stampHtmlTheme } from "#lib/theme/theme.ts";
import { handle as ogygiaHandle } from "ogygia/server";

const SENTRY_DSN =
  "https://09af8526419b32d328f0c046d2ee5d09@o4511356309536768.ingest.us.sentry.io/4511356313010176";

// get session from better auth and populate locals
const localsHandler: Handle = async ({ event, resolve }) => {
  if (building) {
    return resolve(event);
  }

  const auth = getAuth();
  const result = await auth.api.getSession({
    headers: event.request.headers,
  });

  if (result?.user) {
    event.locals.user = result.user;
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

// Order: Sentry instruments the request first; session/locals before auth; preload last on resolve.
// ogygia is last so /__ogygia__ still receives the session and theme cookie, then serves the island.
export const handle: Handle = sequence(
  Sentry.initCloudflareSentryHandle({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1,
  }),
  Sentry.sentryHandle(),
  localsHandler,
  authGuard,
  themeHandler,
  fontPreloadHandler,
  ogygiaHandle()
);

export const handleError = Sentry.handleErrorWithSentry();
