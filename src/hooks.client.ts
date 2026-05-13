// biome-ignore lint/performance/noNamespaceImport: way to use sentry
import * as Sentry from "@sentry/sveltekit";
import { handleErrorWithSentry } from "@sentry/sveltekit";

Sentry.init({
  dsn: "https://09af8526419b32d328f0c046d2ee5d09@o4511356309536768.ingest.us.sentry.io/4511356313010176",

  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/options/#sendDefaultPii
  sendDefaultPii: true,
});

// If you have a custom error handler, pass it to `handleErrorWithSentry`
export const handleError = handleErrorWithSentry();
