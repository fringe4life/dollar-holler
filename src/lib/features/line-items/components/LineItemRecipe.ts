import { sva } from "#styled-system/css/index.js";

export const lineItemFieldRecipe = sva({
  base: {
    input: {
      _ariaInvalid: { borderColor: "destructive" },
      _disabled: { bg: "transparent", borderBottomWidth: 0 },
      _focus: {
        borderBottomColor: "ring",
        borderBottomStyle: "solid",
        outline: "none",
      },
      _userInvalid: { borderColor: "destructive" },
      blockSize: 10,
      borderBottomWidth: 2,
      borderColor: "borderMuted",
      borderStyle: "dashed",
      display: "block",
      inlineSize: "full",
      transitionDuration: "normal",
      transitionProperty: "colors",
    },
    label: {
      color: "textMuted",
      display: { base: "block", sm: "none" },
      fontFamily: "sansserif",
      fontWeight: "bold",
    },
  },
  defaultVariants: {
    align: "left",
    inputType: "text",
  },
  slots: ["root", "label", "input"],
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
