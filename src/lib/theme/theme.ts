import {
  parseStoredTheme,
  THEME_COOKIE_MAX_AGE,
  THEME_COOKIE_NAME,
  type StoredTheme,
  type ThemeChoice,
} from "./schema.ts";

const HTML_OPEN_TAG = /<html\b[^>]*>/;
const THEME_CLASS = /\bclass=(["'])(?:dark|light)\b/;

export const colorSchemeForTheme = (
  theme: StoredTheme | null
): "dark" | "light" | "light dark" => {
  if (theme === "dark" || theme === "light") {
    return theme;
  }

  return "light dark";
};

export const htmlThemeClassName = (
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
    if (THEME_CLASS.test(tag)) {
      return tag;
    }

    return tag.replace(
      "<html",
      `<html class="${stored}" style="color-scheme: ${stored}"`
    );
  });
};

export const applyDocumentTheme = (theme: ThemeChoice): void => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.style.colorScheme = colorSchemeForTheme(
    theme === "system" ? null : theme
  );
};

const persistThemeCookie = (theme: ThemeChoice): void => {
  if (theme === "system") {
    document.cookie = `${THEME_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }

  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; Path=/; Max-Age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
};

export const persistThemeChoice = (theme: ThemeChoice): void => {
  persistThemeCookie(theme);
  applyDocumentTheme(theme);
};

export const readThemeCookie = (): StoredTheme | null => {
  const prefix = `${THEME_COOKIE_NAME}=`;
  const pair = document.cookie
    .split("; ")
    .find((row) => row.startsWith(prefix));
  return parseStoredTheme(pair?.slice(prefix.length));
};
