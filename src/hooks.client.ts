import * as Sentry from "@sentry/sveltekit";
import { hydrateThemeChoice } from "#lib/theme/choice.svelte.ts";
import { applyDocumentTheme, readThemeCookie } from "#lib/theme/theme.ts";

export function init() {
  const theme = readThemeCookie() ?? "system";
  hydrateThemeChoice(theme);
  applyDocumentTheme(theme);
}

Sentry.init({
  dsn: "https://09af8526419b32d328f0c046d2ee5d09@o4511356309536768.ingest.us.sentry.io/4511356313010176",
  tracesSampleRate: 1.0,
});

export const handleError = Sentry.handleErrorWithSentry();
