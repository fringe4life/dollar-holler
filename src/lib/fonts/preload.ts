/**
 * Kit `resolve` preload filter for webfonts.
 *
 * Body (Source Sans 3 Variable) is on every page via `src/app.css`.
 * Money (Space Mono subset) is pulled in by `money()` CSS, so Kit only
 * offers those files on routes that import the CVA. Handwriting (Kalam)
 * is imported next to landing / empty-state UI.
 *
 * Path checks keep a global CSS import from preloading money or Kalam on
 * auth and other unused routes. Match `filename` (source path), not the
 * hashed `path`. `.woff2` only — Fontsource CSS also points at `.woff`.
 *
 * Face → routes:
 * - Source Sans 3 Variable — every page
 * - Space Mono 400/700 subset — `/invoices`, `/clients` (and nested)
 * - Kalam 700 — `/`, invoice/client lists, client detail empty summary
 *
 * This filter does not run in vite dev.
 */

export const BODY_FONT_FILE = "@fontsource-variable/source-sans-3/";
export const HANDWRITING_FONT_FILE = "@fontsource/kalam/";
export const MONEY_FONT_FILE = "src/lib/fonts/money/space-mono-";

const CLIENT_DETAIL_PATH =
  /^\/clients\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type PreloadInput =
  | { path: string; type: "asset" | "css" | "js" }
  | { filename: string; path: string; type: "font" };

const isMoneyFontRoute = (pathname: string): boolean =>
  pathname.startsWith("/invoices") || pathname.startsWith("/clients");

const isHandwritingFontRoute = (pathname: string): boolean =>
  pathname === "/" ||
  pathname === "/invoices" ||
  pathname === "/clients" ||
  CLIENT_DETAIL_PATH.test(pathname);

export const shouldPreloadAsset = (
  input: PreloadInput,
  pathname: string
): boolean => {
  if (input.type === "js" || input.type === "css") {
    return true;
  }

  if (input.type !== "font" || !input.filename.endsWith(".woff2")) {
    return false;
  }

  if (input.filename.includes(BODY_FONT_FILE)) {
    return true;
  }

  if (input.filename.includes(MONEY_FONT_FILE)) {
    return isMoneyFontRoute(pathname);
  }

  if (input.filename.includes(HANDWRITING_FONT_FILE)) {
    return isHandwritingFontRoute(pathname);
  }

  return false;
};
