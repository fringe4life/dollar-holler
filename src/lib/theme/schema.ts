import { type InferOutput, picklist, safeParse } from "valibot";

export const THEME_COOKIE_NAME = "theme";
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const THEME_CHOICES = ["light", "dark", "system"] as const;
const STORED_THEMES = ["light", "dark"] as const;

const themeChoiceSchema = picklist(THEME_CHOICES);
const storedThemeSchema = picklist(STORED_THEMES);

export type ThemeChoice = InferOutput<typeof themeChoiceSchema>;
export type StoredTheme = InferOutput<typeof storedThemeSchema>;

export const parseThemeChoice = (value: unknown): ThemeChoice | null => {
  const result = safeParse(themeChoiceSchema, value);
  return result.success ? result.output : null;
};

export const parseStoredTheme = (value: unknown): StoredTheme | null => {
  const result = safeParse(storedThemeSchema, value);
  return result.success ? result.output : null;
};
