// biome-ignore lint/performance/noNamespaceImport: way to use sentry
import * as Sentry from "@sentry/sveltekit";

Sentry.init({
  dsn: "https://09af8526419b32d328f0c046d2ee5d09@o4511356309536768.ingest.us.sentry.io/4511356313010176",
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
});
