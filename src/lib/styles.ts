import { css } from "styled-system/css";
import { grid } from "styled-system/patterns";

export const actionButton = grid({
  justifyItems: "center",
  fontWeight: "bold",
  color: "daisyBush",
});

export const tableRowHover = css({
  transitionProperty: "translate",
  transitionDuration: "normal",
  transitionTimingFunction: "anticipate",
  position: "relative",
  _after: {
    content: '""',
    position: "absolute",
    inset: 0,
    opacity: 0,
    zIndex: -1,
    borderRadius: "lg",
    boxShadow: "tableRowHover",
    transitionProperty: "opacity",
    transitionDuration: "normal",
    transitionTimingFunction: "anticipate",
  },
  _hover: {
    translate: "0 -2px",
    _after: {
      opacity: "1",
    },
  },
});

export const tableRowBase = css({
  alignItems: "center",
  rounded: "lg",
  backgroundColor: "white",
  paddingBlock: { base: 3, lg: 6 },
  shadow: "tableRow",
});
