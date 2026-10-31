/**
 * Glyphs kept in the Space Mono money subset (`bun run fonts:subset-money`).
 *
 * Covers `Intl.NumberFormat("en", { currency: "USD", style: "currency" })`
 * plus numeric inputs: digits, `$`, grouping/decimal, signs, parens, `%`,
 * NBSP, Unicode minus, and en dash. Letters stay out so labels fall back
 * to Source Sans via `unicode-range`.
 */
export const MONEY_GLYPHS = "$%()+,-./0123456789 \u00A0\u2013\u2212";

const hexCodePoint = (codePoint: number): string =>
  codePoint.toString(16).toUpperCase().padStart(4, "0");

const formatUnicodeRange = (start: number, end: number): string =>
  start === end
    ? `U+${hexCodePoint(start)}`
    : `U+${hexCodePoint(start)}-${hexCodePoint(end)}`;

/** Compact `unicode-range` descriptor for `@font-face`. */
export const toUnicodeRange = (glyphs: string): string => {
  const points = [
    ...new Set(
      Array.from(glyphs, (glyph) => {
        const codePoint = glyph.codePointAt(0);
        if (codePoint === undefined) {
          throw new Error("MONEY_GLYPHS contains an empty code point");
        }
        return codePoint;
      })
    ),
  ].toSorted((left, right) => left - right);

  const first = points[0];
  if (first === undefined) {
    throw new Error("MONEY_GLYPHS must not be empty");
  }

  const ranges: string[] = [];
  let start = first;
  let previous = first;

  for (const point of points.slice(1)) {
    if (point === previous + 1) {
      previous = point;
      continue;
    }
    ranges.push(formatUnicodeRange(start, previous));
    start = point;
    previous = point;
  }

  ranges.push(formatUnicodeRange(start, previous));
  return ranges.join(", ");
};

export const MONEY_UNICODE_RANGE = toUnicodeRange(MONEY_GLYPHS);
