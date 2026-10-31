import { cva } from "#styled-system/css/index.js";

/**
 * Shared voice for displayed currency (#210).
 *
 * Format with `centsToDollars` / `formatTotal`; style with `money()`. Compose
 * into feature CVAs via `cx(money({ size: "inherit" }), …)` so color, weight,
 * and layout stay local.
 *
 * Base picks Source Code Pro (`mono`) plus lining + tabular figures. Tabular
 * is mostly redundant on a true mono face but keeps columns stable if the
 * stack ever falls back, and matches the finance-UI convention. Prefer
 * `font-variant-numeric` over `font-feature-settings`.
 *
 * Left out of base on purpose (see #210):
 * - `slashed-zero` — Source Code Pro supports it (`zero` / `cv12`); busy on
 *   currency; use the `zero` variant when O/0 ambiguity matters
 * - `white-space: nowrap` / `letter-spacing` / weight — layout & hierarchy;
 *   feature recipes already own these
 */
export const money = cva({
  base: {
    fontFamily: "mono",
    fontVariantNumeric: "lining-nums tabular-nums",
  },
  defaultVariants: {
    size: "inherit",
    zero: "plain",
  },
  variants: {
    size: {
      inherit: {},
      lg: {
        fontSize: "xl",
        letterSpacing: "tight",
      },
      md: {
        fontSize: "md",
      },
      sm: {
        fontSize: "sm",
      },
    },
    zero: {
      plain: {},
      slashed: {
        fontVariantNumeric: "lining-nums tabular-nums slashed-zero",
      },
    },
  },
});
