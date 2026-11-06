import { css } from "#styled-system/css/css.js";
import { cx } from "#styled-system/css/cx.js";
import "#lib/fonts/money/money.css";

type MoneySize = "inherit" | "lg" | "md" | "sm";
type MoneyZero = "plain" | "slashed";

interface MoneyProps {
  size?: MoneySize;
  zero?: MoneyZero;
}

/**
 * Shared voice for displayed currency (#210).
 *
 * Format with `centsToDollars` / `formatTotal`; style with `money()`. Compose
 * into feature styles via `cx(money({ size: "inherit" }), …)` so color, weight,
 * and layout stay local.
 *
 * Base picks Space Mono (`mono`, 400/700 — the weights this face ships) plus
 * lining + tabular figures. Tabular is mostly redundant on a true mono face
 * but keeps columns stable if the stack ever falls back, and matches the
 * finance-UI convention. Prefer `font-variant-numeric` over
 * `font-feature-settings`. The woff2s are a money-glyph subset (#211); glyphs
 * outside that range use the next `mono` faces (`Space Mono fallback` /
 * monospace), not Source Sans.
 *
 * Face pick (#212): compared keeping Code Pro, IBM Plex Mono / JetBrains Mono
 * (clearer `$`/figures but still “editor”), Source Sans 3 + `tnum` alone (no
 * second family; amounts blend into labels), and Space Mono. Kept a dedicated
 * mono stack; Space Mono wins on ledger feel vs Code Pro, ships only 400/700
 * (what size maps use), OFL via Fontsource. `money()` API / call sites unchanged.
 *
 * Left out of base on purpose (see #210):
 * - `slashed-zero` — busy on currency; use the `zero` variant when O/0
 *   ambiguity matters (no-op if the face lacks `zero`)
 * - `white-space: nowrap` / `letter-spacing` / weight — layout & hierarchy;
 *   feature styles already own these. `black` snaps to 700.
 *
 * Workaround: top-level `css()` maps instead of `cva` so hashed class names do
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
const moneyBase = css({
  fontFamily: "mono",
  fontVariantNumeric: "lining-nums tabular-nums",
});

const moneyBySize = {
  inherit: "",
  lg: css({
    fontSize: "xl",
    letterSpacing: "tight",
  }),
  md: css({
    fontSize: "md",
  }),
  sm: css({
    fontSize: "sm",
  }),
} as const satisfies Record<MoneySize, string>;

const moneyByZero = {
  plain: "",
  slashed: css({
    fontVariantNumeric: "lining-nums tabular-nums slashed-zero",
  }),
} as const satisfies Record<MoneyZero, string>;

export function money({ size = "inherit", zero = "plain" }: MoneyProps = {}) {
  return cx(moneyBase, moneyBySize[size], moneyByZero[zero]);
}
