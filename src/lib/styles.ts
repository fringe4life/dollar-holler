import { css, cx } from "#styled-system/css/index.js";
import { grid, hoverShadow } from "#styled-system/patterns/index.js";

export type ArrowDirection = "backward" | "forward";

const arrowMotion = {
  fill: "none",
  flexShrink: 0,
  paddingInline: 0,
  transitionDuration: "normal",
  transitionProperty: "translate",
  transitionTimingFunction: {
    base: "anticipate",
    _supportsLinear: "glide",
  },
} as const;

const backwardArrow = css({
  ...arrowMotion,
  _groupActive: { translate: "-0.25rem 0" },
  _groupDisabled: { translate: "0 0" },
  _groupHover: { translate: "-0.25rem 0" },
});

const forwardArrow = css({
  ...arrowMotion,
  _groupActive: { translate: "0.25rem 0" },
  _groupDisabled: { translate: "0 0" },
  _groupHover: { translate: "0.25rem 0" },
});

export const directionalArrow = (direction: ArrowDirection) =>
  direction === "backward" ? backwardArrow : forwardArrow;

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
