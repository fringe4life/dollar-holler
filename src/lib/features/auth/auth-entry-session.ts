import type { RequestEvent } from "@sveltejs/kit";
import { redirect } from "@sveltejs/kit";
import { keepFallback, requestEvent } from "ogygia";
import { resolve } from "$app/paths";

/**
 * Call during a deferred auth-entry island. Anonymous visitors keep the
 * prerendered page; logged-in visitors redirect to the dashboard.
 */
export const redirectAuthenticatedAuthEntry = (): void => {
  const user = requestEvent<RequestEvent>()?.locals.user ?? null;
  if (!user) {
    keepFallback();
  }
  redirect(303, resolve("invoices"));
};
