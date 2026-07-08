import { sva } from "styled-system/css";

export const lineItemFieldRecipe = sva({
  base: {
    border: {
      // the animated span border
      borderColor: "lavenderIndigo",
      borderStyle: "solid",
      borderWidth: 2,
      inset: 0,
      opacity: "0",
      pointerEvents: "none",
      position: "absolute",
      scaleX: 0.9,
      transformOrigin: "left",
      transitionDuration: "normal",
      transitionProperty: ["opacity", "scale"],
      transitionTimingFunction: "anticipate",
    },
    input: {
      _disabled: { bg: "transparent", borderBottomWidth: 0 },
      _focus: { outline: "none" },
      blockSize: 10,
      borderBottomWidth: 2,
      borderColor: "stone.300",
      borderStyle: "dashed",
      display: "block",
      inlineSize: "full",
      transitionDuration: "normal",
      transitionProperty: "colors",
    },
    label: {
      color: "monsoon",
      display: { base: "block", sm: "none" },
      fontFamily: "sansserif",
      fontWeight: "bold",
    },
  },
  defaultVariants: {
    align: "left",
    inputType: "text",
  },
  slots: ["root", "label", "input", "border"],
  variants: {
    align: {
      center: {
        input: { textAlign: "center" },
        label: { textAlign: "center" },
      },
      left: { input: { textAlign: "left" }, label: { textAlign: "left" } },
      right: { input: { textAlign: "right" }, label: { textAlign: "right" } },
    },
    inputType: {
      number: {
        input: { fontFamily: "mono" },
      },
      text: {
        input: { fontFamily: "sansserif", fontSize: "xl", fontWeight: "bold" },
      },
    },
  },
});
