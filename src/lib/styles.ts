import { css, cva, cx } from "#styled-system/css/index.js";
import { grid, hoverShadow } from "#styled-system/patterns/index.js";

export const directionalArrow = cva({
  base: {
    fill: "none",
    flexShrink: 0,
    paddingInline: 0,
    transitionDuration: "normal",
    transitionProperty: "translate",
    transitionTimingFunction: {
      base: "anticipate",
      _supportsLinear: "glide",
    },
    _groupDisabled: { translate: "0 0" },
  },
  variants: {
    direction: {
      backward: {
        _groupActive: { translate: "-0.25rem 0" },
        _groupHover: { translate: "-0.25rem 0" },
      },
      forward: {
        _groupActive: { translate: "0.25rem 0" },
        _groupHover: { translate: "0.25rem 0" },
      },
    },
  },
});

const iconRest = { rotate: "0deg", scale: "1" } as const;

export const buttonIcon = cva({
  base: {
    display: "inline-block",
    flexShrink: 0,
    transformOrigin: "center",
    transitionDuration: "normal",
    transitionProperty: "rotate, scale",
    transitionTimingFunction: {
      base: "anticipate",
      _supportsLinear: "elastic",
    },
    _disabled: iconRest,
    _groupDisabled: iconRest,
  },
  variants: {
    icon: {
      check: {
        _active: { rotate: "-4deg", scale: "0.9" },
        _groupActive: { rotate: "-4deg", scale: "0.9" },
        _groupHover: { rotate: "4deg", scale: "1.1" },
        _hover: { rotate: "4deg", scale: "1.1" },
      },
      plus: {
        _active: { rotate: "90deg", scale: "0.9" },
        _groupActive: { rotate: "90deg", scale: "0.9" },
        _groupHover: { rotate: "90deg", scale: "1.1" },
        _hover: { rotate: "90deg", scale: "1.1" },
      },
    },
  },
});

export const actionButton = grid({
  color: "foreground",
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
  backgroundColor: "surface",
  paddingBlock: { base: 3, lg: 6 },
  rounded: "lg",
  shadow: "tableRow",
});
