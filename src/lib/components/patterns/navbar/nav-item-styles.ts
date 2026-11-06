import { css } from "#styled-system/css/css.js";

export const navItemLiClass = css({
  "&:not(:last-child)": { marginBlockEnd: 6 },
});

/**
 * The label keeps its ink on hover; the accent marks carry the hover state
 * (see NavbarAccent). Colour on hover was two signals for one fact.
 *
 * The current state is an explicit attribute selector rather than the `_current`
 * condition: this Panda build emits nothing for `_current` inside a colour value
 * object, which silently left the active label white.
 */
export const navItemControlClass = css({
  "&[aria-current]": { color: "accent" },
  appearance: "none",
  backgroundColor: "transparent",
  borderWidth: 0,
  color: "navigationForeground",
  cursor: "pointer",
  display: "inline-block",
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  lineHeight: "inherit",
  paddingInline: 8,
  position: "relative",
  transitionProperty: "colors",
  transitionDuration: "normal",
});
