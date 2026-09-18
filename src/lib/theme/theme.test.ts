import { describe, expect, it } from "bun:test";
import {
  colorSchemeForTheme,
  htmlThemeClassName,
  stampHtmlTheme,
} from "./theme.ts";

describe("colorSchemeForTheme", () => {
  it("maps stored themes 1:1 and system to both", () => {
    expect(colorSchemeForTheme("dark")).toBe("dark");
    expect(colorSchemeForTheme("light")).toBe("light");
    expect(colorSchemeForTheme(null)).toBe("light dark");
  });
});

describe("htmlThemeClassName", () => {
  it("is undefined for system (no cookie)", () => {
    expect(htmlThemeClassName(null)).toBeUndefined();
    expect(htmlThemeClassName("dark")).toBe("dark");
  });
});

describe("stampHtmlTheme", () => {
  it("is a no-op when no stored theme", () => {
    const html = '<html lang="en">';
    expect(stampHtmlTheme(html, null)).toBe(html);
  });

  it("adds class and color-scheme on a bare html tag", () => {
    expect(stampHtmlTheme('<html lang="en">', "dark")).toBe(
      '<html class="dark" style="color-scheme: dark" lang="en">'
    );
  });

  it("does not double-stamp an already themed tag", () => {
    const html = '<html class="light" lang="en">';
    expect(stampHtmlTheme(html, "dark")).toBe(html);
  });
});
