import { browser } from "$app/env";

/**
 * Customizable `<select>` support (`appearance: base-select`, Chromium 135+).
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
