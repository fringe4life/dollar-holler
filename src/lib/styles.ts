import { css, cva, cx } from "#styled-system/css/index.js";
import { flex } from "#styled-system/patterns/index.js";

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

export const rowActionRail = css({
  alignItems: "center",
  backgroundColor: "surfaceMuted",
  borderBlockStartColor: "borderSubtle",
  borderBlockStartStyle: "solid",
  borderBlockStartWidth: "1px",
  color: "foreground",
  display: "none",
  gridArea: "actions",
  justifyContent: "space-between",
  minInlineSize: 0,
  paddingBlock: 2,
  paddingInline: { base: 3, "@item-row/xl": 4 },
  "@item-row/md": { display: "flex" },
});

export const rowActionLabel = css({
  color: "textMuted",
  flexShrink: 0,
  fontSize: "2xs",
  fontWeight: "bold",
  letterSpacing: "widest",
  textTransform: "uppercase",
});

export const rowActionButtonGroup = flex({
  align: "center",
  gap: 2,
  justify: "end",
  wrap: "wrap",
});

export const rowSwipeTrigger = css({
  alignItems: "center",
  backgroundColor: "transparent",
  borderRadius: "sm",
  color: "mutedAction",
  cursor: "pointer",
  display: "inline-flex",
  fontSize: "2xs",
  fontWeight: "bold",
  gap: 1,
  letterSpacing: "wider",
  paddingBlock: 1,
  paddingInline: 1,
  textTransform: "uppercase",
  transitionDuration: "normal",
  transitionProperty: "background-color, color, translate",
  _hover: {
    backgroundColor: "warning/20",
    color: "foreground",
    translate: "2px 0",
  },
  _focusVisible: {
    outlineColor: "ring",
    outlineOffset: 2,
    outlineStyle: "solid",
    outlineWidth: 2,
  },
  _active: { translate: "0 0" },
  _dark: {
    color: "mutedAction",
    _hover: {
      backgroundColor: "surfaceSecondary",
      color: "success",
      translate: "none",
    },
    _active: { backgroundColor: "success/15", color: "success" },
  },
});

export const rowActionButton = cx(
  css({
    alignItems: "center",
    backgroundColor: "surface",
    borderColor: "borderSubtle",
    borderRadius: "md",
    borderStyle: "solid",
    borderWidth: "1px",
    color: "foreground",
    cursor: "pointer",
    display: "inline-flex",
    flexDirection: { base: "column", "@item-row/md": "row" },
    flexShrink: 0,
    fontSize: { base: "2xs", "@item-row/md": "sm" },
    fontWeight: "bold",
    gap: { base: 1, "@item-row/md": 1.5 },
    justifyContent: "center",
    minBlockSize: { base: 12, "@item-row/md": 10 },
    minInlineSize: { base: 12, "@item-row/md": 11 },
    paddingBlock: { base: 1, "@item-row/md": 0 },
    paddingInline: { base: 1, "@item-row/md": 2.5 },
    textDecoration: "none",
    transitionDuration: "normal",
    transitionProperty:
      "background-color, border-color, box-shadow, color, rotate, translate",
    transitionTimingFunction: "glide",
    _hover: {
      backgroundColor: "warning/20",
      borderColor: "warning/70",
      boxShadow: "colored",
      rotate: "-0.5deg",
      translate: "0 -1px",
    },
    _focusVisible: {
      outlineColor: "ring",
      outlineOffset: 2,
      outlineStyle: "solid",
      outlineWidth: 2,
    },
    _active: {
      boxShadow: "none",
      translate: "0 0",
    },
    _dark: {
      _hover: {
        backgroundColor: "surfaceSecondary",
        borderColor: "ring/70",
        boxShadow: "none",
        rotate: "none",
        translate: "none",
      },
      _active: {
        backgroundColor: "success/15",
        borderColor: "success",
        color: "success",
      },
    },
    _motionReduce: { transitionDuration: "0.01ms" },
  })
);

export const rowActionDangerButton = css({
  color: "destructive",
  _hover: { backgroundColor: "destructive/10", borderColor: "destructive/50" },
  _dark: {
    color: "destructive",
    _hover: {
      backgroundColor: "destructive/15",
      borderColor: "destructive/60",
    },
  },
});

export const tableRowBase = css({
  alignItems: "center",
  backgroundColor: "surface",
  borderColor: "borderSubtle",
  borderRadius: "lg",
  borderStyle: "solid",
  borderWidth: "1px",
  overflow: "hidden",
  shadow: "tableRow",
  transitionDuration: "normal",
  transitionProperty: "background-color, border-color, box-shadow",
  transitionTimingFunction: "glide",
  _hover: {
    backgroundColor: "surfaceSecondary",
    boxShadow: "tableRowHover",
  },
  _focusWithin: {
    outlineColor: "ring",
    outlineOffset: 2,
    outlineStyle: "solid",
    outlineWidth: "1px",
  },
  _dark: {
    _hover: {
      backgroundColor: "surface",
      boxShadow: "none",
    },
    _focusWithin: { outlineColor: "success" },
  },
  _motionReduce: { transitionDuration: "0.01ms" },
});
