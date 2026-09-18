import type { ThemeChoice } from "./schema.ts";
import { persistThemeChoice } from "./theme.ts";

/** Client-only live choice. Null on the server so SSR stays request-scoped. */
const themeChoice = $state<{ current: ThemeChoice | null }>({
  current: null,
});

export const resolvedThemeChoice = (fromLayout: ThemeChoice): ThemeChoice =>
  themeChoice.current ?? fromLayout;

export const hydrateThemeChoice = (theme: ThemeChoice): void => {
  themeChoice.current = theme;
};

export const selectThemeChoice = (theme: ThemeChoice): void => {
  themeChoice.current = theme;
  persistThemeChoice(theme);
};
