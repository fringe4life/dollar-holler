import { defineGlobalStyles } from "@pandacss/dev";

export const globalCss = defineGlobalStyles({
  body: {
    backgroundColor: "background",
    color: "foreground",
    fontFamily: "sansserif",
  },
  html: {
    colorScheme: "light dark",
    scrollbarGutter: "stable",
    // Attribute on `:root`, or `:has` if `data-theme` is on a descendant.
    "&[data-theme=dark], &:has([data-theme=dark])": {
      colorScheme: "dark",
    },
    "&[data-theme=light], &:has([data-theme=light])": {
      colorScheme: "light",
    },
  },
  "input[type='number']": {
    appearance: "textfield",
  },
  "input[type='number']::-webkit-inner-spin-button": {
    appearance: "none",
    margin: "0",
  },
  "input[type='number']::-webkit-outer-spin-button": {
    appearance: "none",
    margin: "0",
  },
  label: {
    color: "textMuted",
    display: "block",
    fontFamily: "sansserif",
    fontWeight: "bold",
  },
  svg: {
    fill: "currentColor",
  },
});
