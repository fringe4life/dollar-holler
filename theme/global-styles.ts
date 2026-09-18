import { defineGlobalStyles } from "@pandacss/dev";

export const globalCss = defineGlobalStyles({
  body: {
    backgroundColor: "background",
    color: "foreground",
    fontFamily: "sansserif",
  },
  html: {
    scrollbarGutter: "stable",
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
