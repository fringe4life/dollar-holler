// Disabled: @sentry/sveltekit v10 client SDK imports `$app/stores`, which SvelteKit 3
// removed (throws on subscribe during Sentry.init). Re-enable once Sentry SDK v11 ships,
// which drops pre-Svelte 5 support and migrates to `$app/state`.
// Tracking: https://github.com/getsentry/sentry-javascript/issues/21502 (SvelteKit 3 support)
//           https://github.com/getsentry/sentry-javascript/issues/18853 (drop Svelte 3/4, milestone 11.0.0)
// biome-ignore lint/performance/noNamespaceImport: way to use sentry
// import * as Sentry from "@sentry/sveltekit";
// import { handleErrorWithSentry } from "@sentry/sveltekit";

// Sentry.init({
//   dsn: "https://09af8526419b32d328f0c046d2ee5d09@o4511356309536768.ingest.us.sentry.io/4511356313010176",

//   // Enable logs to be sent to Sentry
//   enableLogs: true,

//   // Enable sending user PII (Personally Identifiable Information)
//   // https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/options/#sendDefaultPii
//   sendDefaultPii: true,

//   tracesSampleRate: 1.0,
// });

// // If you have a custom error handler, pass it to `handleErrorWithSentry`
// export const handleError = handleErrorWithSentry();
