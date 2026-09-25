import { describe, expect, it } from "bun:test";
import {
  colorSchemeForTheme,
  htmlThemeClassName,
  parseThemeCookieHeader,
  serializeThemeCookie,
  stampHtmlTheme,
  withThemeViewTransition,
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

describe("serializeThemeCookie", () => {
  it("clears on system and omits Secure", () => {
    expect(serializeThemeCookie("system", true)).toBe(
      "theme=; Path=/; Max-Age=0; SameSite=Lax"
    );
  });

  it("encodes allow-listed values and adds Secure on https", () => {
    expect(serializeThemeCookie("dark", true)).toBe(
      "theme=dark; Path=/; Max-Age=31536000; SameSite=Lax; Secure"
    );
    expect(serializeThemeCookie("light", false)).toBe(
      "theme=light; Path=/; Max-Age=31536000; SameSite=Lax"
    );
  });
});

describe("parseThemeCookieHeader", () => {
  it("reads encoded light/dark and rejects system/junk", () => {
    expect(parseThemeCookieHeader("theme=dark")).toBe("dark");
    expect(parseThemeCookieHeader("other=1; theme=light")).toBe("light");
    expect(parseThemeCookieHeader("theme=system")).toBeNull();
    expect(parseThemeCookieHeader("")).toBeNull();
  });
});

describe("withThemeViewTransition", () => {
  const withBrowserGlobals = (
    startViewTransition:
      | ((
          options: ViewTransitionUpdateCallback | StartViewTransitionOptions
        ) => {
          ready: Promise<void>;
          finished: Promise<void>;
          updateCallbackDone: Promise<void>;
        })
      | undefined,
    callback: () => void
  ): void => {
    const originalDocument = Object.getOwnPropertyDescriptor(
      globalThis,
      "document"
    );
    const originalWindow = Object.getOwnPropertyDescriptor(
      globalThis,
      "window"
    );

    try {
      Object.defineProperty(globalThis, "document", {
        configurable: true,
        value: startViewTransition === undefined ? {} : { startViewTransition },
      });
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: {},
      });
      callback();
    } finally {
      if (originalDocument === undefined) {
        Reflect.deleteProperty(globalThis, "document");
      } else {
        Object.defineProperty(globalThis, "document", originalDocument);
      }
      if (originalWindow === undefined) {
        Reflect.deleteProperty(globalThis, "window");
      } else {
        Object.defineProperty(globalThis, "window", originalWindow);
      }
    }
  };

  it("runs updates within a typed theme transition", async () => {
    let receivedTypes: string[] | undefined;
    let transitionUpdate: (() => void | Promise<void>) | undefined;
    let updates = 0;

    withBrowserGlobals(
      (options) => {
        if (typeof options !== "function") {
          receivedTypes = options.types ?? undefined;
          transitionUpdate = options.update ?? undefined;
        }
        return {
          ready: Promise.resolve(),
          finished: new Promise<void>(() => undefined),
          updateCallbackDone: Promise.resolve(),
        };
      },
      () => withThemeViewTransition(() => updates++)
    );

    expect(receivedTypes).toEqual(["theme-change"]);
    expect(updates).toBe(0);
    await transitionUpdate?.();
    expect(updates).toBe(1);
  });

  it("updates immediately when the API is unavailable", () => {
    let updates = 0;

    withBrowserGlobals(undefined, () =>
      withThemeViewTransition(() => updates++)
    );

    expect(updates).toBe(1);
  });
});
