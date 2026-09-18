import { describe, expect, it } from "bun:test";
import { parseStoredTheme, parseThemeChoice } from "./schema.ts";

describe("parseStoredTheme", () => {
  it("accepts light and dark", () => {
    expect(parseStoredTheme("light")).toBe("light");
    expect(parseStoredTheme("dark")).toBe("dark");
  });

  it("rejects system, empty, and junk", () => {
    expect(parseStoredTheme("system")).toBeNull();
    expect(parseStoredTheme("")).toBeNull();
    expect(parseStoredTheme("neon")).toBeNull();
    expect(parseStoredTheme(undefined)).toBeNull();
  });
});

describe("parseThemeChoice", () => {
  it("accepts light, dark, and system", () => {
    expect(parseThemeChoice("light")).toBe("light");
    expect(parseThemeChoice("dark")).toBe("dark");
    expect(parseThemeChoice("system")).toBe("system");
  });

  it("rejects unknown values", () => {
    expect(parseThemeChoice("auto")).toBeNull();
  });
});
