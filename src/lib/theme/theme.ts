import { withViewTransition } from "#lib/client/view-transition.ts";
import {
  parseStoredTheme,
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  type StoredTheme,
  type ThemeChoice,
} from "./schema.ts";

const HTML_OPEN_TAG = /<html\b[^>]*>/;
const THEME_ATTR = /\bdata-theme=(["'])(?:dark|light)\1/;

export const htmlThemeAttribute = (
  theme: StoredTheme | null
): StoredTheme | undefined => (theme === null ? undefined : theme);

export const stampHtmlTheme = (
  html: string,
  stored: StoredTheme | null
): string => {
  if (stored === null) {
    return html;
  }

  return html.replace(HTML_OPEN_TAG, (tag) => {
    if (THEME_ATTR.test(tag)) {
      return tag;
    }

    return tag.replace("<html", `<html data-theme="${stored}"`);
  });
};

export const applyDocumentTheme = (theme: ThemeChoice): void => {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.style.removeProperty("color-scheme");
  if (theme === "system") {
    root.removeAttribute("data-theme");
    return;
  }

  root.setAttribute("data-theme", theme);
};

export const withThemeViewTransition = (update: () => void): void => {
  void withViewTransition({
    types: ["theme-change"],
    update,
  }).catch(() => {
    update();
  });
};

const encodedCookieName = encodeURIComponent(THEME_COOKIE_NAME);

export const serializeThemeCookie = (
  theme: ThemeChoice,
  https: boolean
): string => {
  if (theme === "system") {
    return `${encodedCookieName}=; Path=/; Max-Age=0; SameSite=Lax`;
  }

  const value = encodeURIComponent(theme);
  const secure = https ? "; Secure" : "";
  return `${encodedCookieName}=${value}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
};

export const parseThemeCookieHeader = (
  cookieHeader: string
): StoredTheme | null => {
  const prefix = `${encodedCookieName}=`;
  const pair = cookieHeader.split("; ").find((row) => row.startsWith(prefix));
  if (pair === undefined) {
    return null;
  }

  return parseStoredTheme(decodeURIComponent(pair.slice(prefix.length)));
};

const persistThemeCookie = (theme: ThemeChoice): void => {
  document.cookie = serializeThemeCookie(theme, location.protocol === "https:");
};

export const persistThemeChoice = (theme: ThemeChoice): void => {
  persistThemeCookie(theme);
  applyDocumentTheme(theme);
};

export const readThemeCookie = (): StoredTheme | null =>
  parseThemeCookieHeader(document.cookie);
