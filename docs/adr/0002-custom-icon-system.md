# Filled SVG glyphs

Interactive icons are **filled** hand-authored SVG in `src/lib/components/primitives/icons/` — one file per glyph, no `Icon` suffix. House ink is `svg { fill: currentColor }` in [`theme/global-styles.ts`](../../theme/global-styles.ts). That filled language is why the stroke pack left: `@lucide/svelte` and its three `fill: none` reverse-overrides are gone.

**Owner role** gates state: a glyph animates only what its owner can reach. Motion is native CSS (transitions, keyframes, custom properties). Shared **beats** live in `icons/interaction.ts`; one-offs colocate on the glyph.

Accepted: more files to draw, optical review at 16/18/24, no upstream icon stream.

Add or edit a glyph: [`docs/icon-system.md`](../icon-system.md). Parent [#259](https://github.com/fringe4life/dollar-holler/issues/259).
