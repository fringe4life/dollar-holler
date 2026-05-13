import { css, cx } from "styled-system/css";
import { grid, hoverShadow } from "styled-system/patterns";

export const actionButton = grid({
  justifyItems: "center",
  fontWeight: "bold",
  color: "daisyBush",
});

export const tableRowHover = cx(
  css({
    transitionProperty: "translate",
    transitionDuration: "normal",
    transitionTimingFunction: "anticipate",
    _hover: {
      translate: "0 -2px",
    },
  }),
  hoverShadow({ shadow: "tableRowHover" })
);

export const tableRowBase = css({
  alignItems: "center",
  rounded: "lg",
  backgroundColor: "white",
  paddingBlock: { base: 3, lg: 6 },
  shadow: "tableRow",
});
