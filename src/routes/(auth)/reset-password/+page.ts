import type { PageLoad } from "./$types";

/** Token is in the query string; cannot prerender with the auth layout. */
export const prerender = false;

export const load: PageLoad = ({ url }) => ({
  token: url.searchParams.get("token") ?? "",
});
