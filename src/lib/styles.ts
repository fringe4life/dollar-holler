import { css, cx } from "styled-system/css";
import { grid, hoverShadow } from "styled-system/patterns";

export const actionButton = grid({
  color: "daisyBush",
  fontWeight: "bold",
  justifyItems: "center",
});

export const tableRowHover = cx(
  css({
    _hover: {
      translate: "0 -2px",
    },
    transitionDuration: "normal",
    transitionProperty: "translate",
    transitionTimingFunction: "anticipate",
  }),
  hoverShadow({ shadow: "tableRowHover" })
);

export const tableRowBase = css({
  alignItems: "center",
  backgroundColor: "white",
  paddingBlock: { base: 3, lg: 6 },
  rounded: "lg",
  shadow: "tableRow",
});
