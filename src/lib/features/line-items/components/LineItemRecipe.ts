import { sva } from "styled-system/css";

export const lineItemFieldRecipe = sva({
  slots: ["root", "label", "input", "border"],
  base: {
    label: {
      display: { base: "block", sm: "none" },
      fontFamily: "sansserif",
      color: "monsoon",
      fontWeight: "bold",
    },
    input: {
      display: "block",
      blockSize: 10,
      inlineSize: "full",
      borderBottomWidth: 2,
      borderStyle: "dashed",
      borderColor: "stone.300",
      transitionProperty: "colors",
      transitionDuration: "normal",
      _disabled: { borderBottomWidth: 0, bg: "transparent" },
      _focus: { outline: "none" },
    },
    border: {
      // the animated span border
      borderColor: "lavenderIndigo",
      transitionTimingFunction: "anticipate",
      pointerEvents: "none",
      position: "absolute",
      inset: 0,
      transformOrigin: "left",
      scaleX: 0.9,
      borderWidth: 2,
      borderStyle: "solid",
      opacity: "0",
      transitionProperty: ["opacity", "scale"],
      transitionDuration: "normal",
    },
  },
  variants: {
    inputType: {
      text: {
        input: { fontFamily: "sansserif", fontSize: "xl", fontWeight: "bold" },
      },
      number: {
        input: { fontFamily: "mono" },
      },
    },
    align: {
      left: { input: { textAlign: "left" }, label: { textAlign: "left" } },
      center: {
        input: { textAlign: "center" },
        label: { textAlign: "center" },
      },
      right: { input: { textAlign: "right" }, label: { textAlign: "right" } },
    },
  },
  defaultVariants: {
    inputType: "text",
    align: "left",
  },
});
