import { cva } from "#styled-system/css/index.js";
import "#lib/fonts/money/money.css";

/**
 * Shared voice for displayed currency (#210).
 *
 * Format with `centsToDollars` / `formatTotal`; style with `money()`. Compose
 * into feature CVAs via `cx(money({ size: "inherit" }), …)` so color, weight,
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
 * (what recipes use), OFL via Fontsource. `money()` API / call sites unchanged.
 *
 * Left out of base on purpose (see #210):
 * - `slashed-zero` — busy on currency; use the `zero` variant when O/0
 *   ambiguity matters (no-op if the face lacks `zero`)
 * - `white-space: nowrap` / `letter-spacing` / weight — layout & hierarchy;
 *   feature recipes already own these. `black` snaps to 700.
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
