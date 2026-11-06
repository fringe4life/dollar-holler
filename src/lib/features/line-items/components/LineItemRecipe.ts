import { css } from "#styled-system/css/css.js";
import { cx } from "#styled-system/css/cx.js";

type LineItemAlign = "center" | "left" | "right";
type LineItemInputType = "number" | "text";

interface LineItemFieldProps {
  align?: LineItemAlign;
  inputType?: LineItemInputType;
}

/**
 * Workaround: top-level `css()` maps instead of `sva` so hashed class names do
 * not force the full recipe runtime into the client bundle.
 *
 * @remarks
 * Still required on `@pandacss/vite@2.5.0` / `@pandacss/dev@2.5.0` with
 * `hash: true`. Drop when Panda folds hashed local `cva`/`sva` to string
 * lookups; re-verify no client chunk with `compoundVariants` / `__cva__`
 * after clean build.
 *
 * @see https://github.com/chakra-ui/panda/issues/3853 — related transform diagnostics
 * @see https://github.com/fringe4life/van-life/issues/471 — established pattern
 * @see https://github.com/fringe4life/dollar-holler/issues/109 — tracking
 */
const lineItemInputBase = css({
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
});

const lineItemLabelBase = css({
  color: "textMuted",
  display: { base: "block", sm: "none" },
  fontFamily: "sansserif",
  fontWeight: "bold",
});

const lineItemInputByAlign = {
  center: css({ textAlign: "center" }),
  left: css({ textAlign: "left" }),
  right: css({ textAlign: "right" }),
} as const satisfies Record<LineItemAlign, string>;

const lineItemLabelByAlign = {
  center: css({ textAlign: "center" }),
  left: css({ textAlign: "left" }),
  right: css({ textAlign: "right" }),
} as const satisfies Record<LineItemAlign, string>;

const lineItemInputByType = {
  // Money voice (`money()`) is composed at the input call site (#210).
  number: "",
  text: css({ fontFamily: "sansserif", fontSize: "xl", fontWeight: "bold" }),
} as const satisfies Record<LineItemInputType, string>;

export function lineItemFieldRecipe({
  align = "left",
  inputType = "text",
}: LineItemFieldProps = {}) {
  return {
    input: cx(
      lineItemInputBase,
      lineItemInputByAlign[align],
      lineItemInputByType[inputType]
    ),
    label: cx(lineItemLabelBase, lineItemLabelByAlign[align]),
    root: "",
  };
}
