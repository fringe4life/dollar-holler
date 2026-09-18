import { definePattern } from "@pandacss/dev";

export const between = definePattern({
  description: "a flex box that aligns items to center and justifies between",
  transform(properties) {
    return {
      alignItems: "center",
      display: "flex",
      justifyContent: "space-between",
      ...properties,
    };
  },
});

export const hoverShadow = definePattern({
  description: "reveals a box shadow via an ::after pseudo-element on hover",
  properties: {
    shadow: { type: "token", value: "shadows" },
  },
  transform({ shadow }) {
    return {
      _after: {
        boxShadow: shadow,
        content: '""',
        inset: "0",
        opacity: "0",
        position: "absolute",
        rounded: "inherit",
        transitionDuration: "normal",
        transitionProperty: "opacity",
        zIndex: -1,
      },
      _hover: {
        _after: {
          opacity: "1",
        },
      },
      position: "relative",
    };
  },
});
