import type { RequestEvent } from "@sveltejs/kit";
import { keepFallback, requestEvent } from "ogygia";

/**
 * Call during component setup. Anonymous visitors keep the prerendered
 * fallback. `keepFallback` throws, so the caller only continues when logged in.
 */
export const keepAnonymousLandingFallback = (): void => {
  const user = requestEvent<RequestEvent>()?.locals.user ?? null;
  if (!user) {
    keepFallback();
  }
};
