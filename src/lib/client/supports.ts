import { browser } from "$app/env";

/**
 * Customizable `<select>` support (`appearance: base-select`, Chromium 135+,
 * Safari iOS 27+).
 *
 * Evaluated once on the client; during SSR this is `false` so the server
 * always renders a classic `<select>`. Rich option content (flags, avatars,
 * icons) and the `<button><selectedcontent>` pair are only inserted after
 * hydration in supporting browsers, keeping legacy parsers away from markup
 * they would strip (progressive enhancement).
 */
export const supportsBaseSelect =
  browser &&
  typeof CSS !== "undefined" &&
  CSS.supports("appearance", "base-select");

/**
 * CSS Typed OM (`CSS.px`, `attributeStyleMap`).
 *
 * Ships in Chrome 66+, Safari 16.4+, Edge 79+. Firefox Nightly 154+ enables
 * it by default; Release/Beta still behind `layout.css.typed-om.enabled`
 * (not Baseline). Evaluated once on the client; `false` during SSR.
 */
export const supportsCssTypedOm =
  browser && typeof CSS !== "undefined" && typeof CSS.px === "function";
