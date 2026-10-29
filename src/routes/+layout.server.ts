import { building } from "$app/env";
import type { LayoutServerLoad } from "./$types";
import { THEME_COOKIE_NAME, parseStoredTheme } from "#lib/theme/schema.ts";

export const load: LayoutServerLoad = ({ locals: { user }, cookies }) => {
  if (building) {
    return {
      cookies: [],
      theme: null,
      user: null,
    };
  }

  return {
    cookies: cookies.getAll(),
    theme: parseStoredTheme(cookies.get(THEME_COOKIE_NAME)),
    user,
  };
};
