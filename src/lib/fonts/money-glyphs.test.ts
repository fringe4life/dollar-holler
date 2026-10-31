import { describe, expect, it } from "bun:test";
import { centsToDollars, formatTotal } from "#lib/utils/moneyHelpers.ts";
import {
  MONEY_GLYPHS,
  MONEY_UNICODE_RANGE,
  toUnicodeRange,
} from "./money-glyphs.ts";

const formatterSamples = [
  centsToDollars(0),
  centsToDollars(1),
  centsToDollars(123_456),
  centsToDollars(-99),
  formatTotal(10_000, 10),
  new Intl.NumberFormat("en", {
    currency: "USD",
    currencySign: "accounting",
    style: "currency",
  }).format(-1234.56),
];

describe("MONEY_GLYPHS", () => {
  it("covers en-US currency formatter output", () => {
    for (const sample of formatterSamples) {
      for (const glyph of sample) {
        expect(MONEY_GLYPHS.includes(glyph)).toBe(true);
      }
    }
  });

  it("covers HTML number-input exponent notation", () => {
    for (const glyph of "1e3E-2") {
      expect(MONEY_GLYPHS.includes(glyph)).toBe(true);
    }
  });
});

describe("toUnicodeRange", () => {
  it("merges consecutive code points", () => {
    expect(toUnicodeRange("ABC")).toBe("U+0041-0043");
    expect(toUnicodeRange("$%")).toBe("U+0024-0025");
  });

  it("matches the committed money subset descriptor", () => {
    expect(MONEY_UNICODE_RANGE).toBe(toUnicodeRange(MONEY_GLYPHS));
    expect(MONEY_UNICODE_RANGE.includes("U+0024")).toBe(true);
    expect(MONEY_UNICODE_RANGE.includes("U+002B-0039")).toBe(true);
  });
});
