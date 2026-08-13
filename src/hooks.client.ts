import * as Sentry from "@sentry/sveltekit";
import type { HandleClientError } from "@sveltejs/kit/hooks";

Sentry.init({
  dsn: "https://09af8526419b32d328f0c046d2ee5d09@o4511356309536768.ingest.us.sentry.io/4511356313010176",

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // Enable sending user PII (Personally Identifiable Information)
  // https://docs.sentry.io/platforms/javascript/guides/sveltekit/configuration/options/#sendDefaultPii
  sendDefaultPii: true,

  tracesSampleRate: 1.0,
});

/**
 * Kit 3 moved status onto `error` / kind payloads. Sentry's stock
 * `handleErrorWithSentry` still reads deprecated top-level `input.status`.
 */
const statusFromCaught = (input: Parameters<HandleClientError>[0]): number => {
  const { kind, error } = input;
  if (
    (kind === "app" || kind === "framework") &&
    error &&
    typeof error === "object" &&
    "status" in error &&
    typeof error.status === "number"
  ) {
    return error.status;
  }
  return 500;
};

export const handleError: HandleClientError = (input) => {
  const status = statusFromCaught(input);
  if (status >= 400 && status < 500) {
    return;
  }

  Sentry.captureException(input.error, {
    mechanism: {
      handled: false,
      type: "auto.function.sveltekit.handle_error",
    },
  });
};
