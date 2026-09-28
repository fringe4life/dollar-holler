// biome-ignore lint/performance/noNamespaceImport: way to use sentry
import * as Sentry from "@sentry/sveltekit";
import { redirect } from "@sveltejs/kit";
import { type Handle, sequence } from "@sveltejs/kit/hooks";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/env";
import { getAuth } from "#lib/auth.server.ts";
import { THEME_COOKIE_NAME, parseStoredTheme } from "#lib/theme/schema.ts";
import { stampHtmlTheme } from "#lib/theme/theme.ts";

const SENTRY_DSN =
  "https://09af8526419b32d328f0c046d2ee5d09@o4511356309536768.ingest.us.sentry.io/4511356313010176";

// get session from better auth and populate locals
const localsHandler: Handle = async ({ event, resolve }) => {
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

  // if logged in an attempting to access login or signup, redirect to invoices
  if (
    event.locals.user &&
    UNPROTECTED_ROUTES.some((route) => path.startsWith(route))
  ) {
    throw redirect(303, "/invoices");
  }

  return resolve(event);
};

/** Stamp `.dark` / `.light` on `<html>` when the theme cookie is set. */
const themeHandler: Handle = ({ event, resolve }) => {
  const stored = parseStoredTheme(event.cookies.get(THEME_COOKIE_NAME));

  return resolve(event, {
    transformPageChunk: ({ html }) => stampHtmlTheme(html, stored),
  });
};

/** Body face only. `filename` is the source path; `path` is the hashed URL. */
const BODY_FONT_FILE = "@fontsource-variable/source-sans-3/";

/**
 * Preload JS, CSS, and the body font (Source Sans 3 woff2).
 *
 * This filter runs for every page, so each match is an extra download on
 * landing and login too. Source Sans 3 is the `body` face, so it is the
 * text on first paint. Source Code Pro is only invoice line items, and
 * Kalam is only empty states; those still load from `@font-face` when used.
 *
 * Match `filename` (the source path). `path` is the hashed build URL.
 * `.woff2` only: the Fontsource CSS also points at `.woff`, and Kit would
 * preload that fallback too. This filter does not run in vite dev.
 */
const fontPreloadHandler: Handle = async ({ event, resolve }) =>
  resolve(event, {
    preload: (input) => {
      if (input.type === "js" || input.type === "css") {
        return true;
      }

      return (
        input.type === "font" &&
        input.filename.endsWith(".woff2") &&
        input.filename.includes(BODY_FONT_FILE)
      );
    },
  });

// Order: Sentry instruments the request first; session/locals before auth; preload last on resolve.
export const handle: Handle = sequence(
  Sentry.initCloudflareSentryHandle({
    dsn: SENTRY_DSN,
    tracesSampleRate: 1,
  }),
  Sentry.sentryHandle(),
  localsHandler,
  authGuard,
  themeHandler,
  fontPreloadHandler
);

export const handleError = Sentry.handleErrorWithSentry();
