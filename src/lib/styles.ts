import { css, cx } from "#styled-system/css/index.js";
import { grid, hoverShadow } from "#styled-system/patterns/index.js";

export type ArrowDirection = "backward" | "forward";
export type ButtonIcon = "check" | "plus";

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

const arrowViewMotion = {
  animationFillMode: "both",
  animationRange: "cover 35% cover 65%",
  animationTimeline: "view(block)",
  animationTimingFunction: "linear",
} as const;

const backwardArrow = css({
  ...arrowMotion,
  _groupActive: { translate: "-0.25rem 0" },
  _groupHover: { translate: "-0.25rem 0" },
  _groupDisabled: { translate: "0 0" },
  _hoverNone: {
    _supportsViewTimeline: {
      ...arrowViewMotion,
      animationName: "arrow-nudge-backward",
    },
  },
});

const forwardArrow = css({
  ...arrowMotion,
  _groupActive: { translate: "0.25rem 0" },
  _groupHover: { translate: "0.25rem 0" },
  _groupDisabled: { translate: "0 0" },
  _hoverNone: {
    _supportsViewTimeline: {
      ...arrowViewMotion,
      animationName: "arrow-nudge-forward",
    },
  },
});

const iconMotion = {
  display: "inline-block",
  flexShrink: 0,
  transformOrigin: "center",
  transitionDuration: "normal",
  transitionProperty: "rotate, scale",
  transitionTimingFunction: {
    base: "anticipate",
    _supportsLinear: "elastic",
  },
} as const;

const iconRest = { rotate: "0deg", scale: "1" } as const;

const checkIcon = css({
  ...iconMotion,
  _active: { rotate: "-4deg", scale: "0.9" },
  _disabled: iconRest,
  _groupActive: { rotate: "-4deg", scale: "0.9" },
  _groupDisabled: iconRest,
  _groupHover: { rotate: "4deg", scale: "1.1" },
  _hover: { rotate: "4deg", scale: "1.1" },
});

const plusIcon = css({
  ...iconMotion,
  _active: { rotate: "90deg", scale: "0.9" },
  _disabled: iconRest,
  _groupActive: { rotate: "90deg", scale: "0.9" },
  _groupDisabled: iconRest,
  _groupHover: { rotate: "90deg", scale: "1.1" },
  _hover: { rotate: "90deg", scale: "1.1" },
});

export const directionalArrow = (direction: ArrowDirection) =>
  direction === "backward" ? backwardArrow : forwardArrow;

export const buttonIcon = (icon: ButtonIcon) =>
  icon === "check" ? checkIcon : plusIcon;

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
