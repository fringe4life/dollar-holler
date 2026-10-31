import { describe, expect, it } from "bun:test";
import {
  BODY_FONT_FILE,
  HANDWRITING_FONT_FILE,
  MONEY_FONT_FILE,
  shouldPreloadAsset,
} from "./preload.ts";

const bodyFont = {
  filename: `${BODY_FONT_FILE}files/source-sans-3-latin-wght-normal.woff2`,
  path: "/_app/immutable/assets/source-sans.woff2",
  type: "font" as const,
};

const moneyFont = {
  filename: `${MONEY_FONT_FILE}400.woff2`,
  path: "/_app/immutable/assets/space-mono-400.woff2",
  type: "font" as const,
};

const kalamFont = {
  filename: `node_modules/${HANDWRITING_FONT_FILE}files/kalam-latin-700-normal.woff2`,
  path: "/_app/immutable/assets/kalam.woff2",
  type: "font" as const,
};

const kalamWoff = {
  filename: `node_modules/${HANDWRITING_FONT_FILE}files/kalam-latin-700-normal.woff`,
  path: "/_app/immutable/assets/kalam.woff",
  type: "font" as const,
};

describe("shouldPreloadAsset", () => {
  it("preloads js and css on every route", () => {
    expect(
      shouldPreloadAsset({ path: "/_app/immutable/entry.js", type: "js" }, "/")
    ).toBe(true);
    expect(
      shouldPreloadAsset(
        { path: "/_app/immutable/entry.css", type: "css" },
        "/login"
      )
    ).toBe(true);
  });

  it("preloads the body face everywhere, woff2 only", () => {
    expect(shouldPreloadAsset(bodyFont, "/login")).toBe(true);
    expect(shouldPreloadAsset(bodyFont, "/invoices")).toBe(true);
    expect(
      shouldPreloadAsset(
        { ...bodyFont, filename: bodyFont.filename.replace(".woff2", ".woff") },
        "/"
      )
    ).toBe(false);
  });

  it("preloads money only on invoice and client routes", () => {
    expect(shouldPreloadAsset(moneyFont, "/invoices")).toBe(true);
    expect(shouldPreloadAsset(moneyFont, "/clients/abc")).toBe(true);
    expect(shouldPreloadAsset(moneyFont, "/login")).toBe(false);
    expect(shouldPreloadAsset(moneyFont, "/")).toBe(false);
    expect(shouldPreloadAsset(moneyFont, "/settings")).toBe(false);
  });

  it("preloads Kalam on landing, lists, and client detail", () => {
    expect(shouldPreloadAsset(kalamFont, "/")).toBe(true);
    expect(shouldPreloadAsset(kalamFont, "/invoices")).toBe(true);
    expect(shouldPreloadAsset(kalamFont, "/clients")).toBe(true);
    expect(
      shouldPreloadAsset(
        kalamFont,
        "/clients/01234567-89ab-cdef-0123-456789abcdef"
      )
    ).toBe(true);
    expect(shouldPreloadAsset(kalamFont, "/invoices/thanks")).toBe(false);
    expect(shouldPreloadAsset(kalamFont, "/login")).toBe(false);
    expect(shouldPreloadAsset(kalamWoff, "/")).toBe(false);
  });
});
