import { defineConfig } from "@pandacss/dev";
import presetBase from "@pandacss/preset-base";
import presetPanda from "@pandacss/preset-panda";
import { conditions } from "./theme/conditions";
import { globalCss } from "./theme/global-styles";
import { keyframes } from "./theme/keyframes";
import { between, hoverShadow } from "./theme/patterns";
import { semanticTokens } from "./theme/semantic-tokens";
import { tokens } from "./theme/tokens";

export default defineConfig({
  conditions,
  // Files to exclude
  exclude: [],
  globalCss,
  globalVars: {
    "--rotate-distance": {
      inherits: false,
      initialValue: "0deg",
      syntax: "<angle>",
    },
    "--slide-distance": {
      inherits: false,
      initialValue: "0px",
      syntax: "<length>",
    },
  },
  // Where to look for your css declarations
  include: ["./src/**/*.svelte", "./src/**/*.ts", "./src/**/*.js"],
  minify: true,
  optimize: {
    // VT keyframe refs live in theme/global-styles.ts (pagination + theme-change)
    // so extract counts them; safe to tree-shake unused theme keyframes.
    removeUnusedKeyframes: true,
    removeUnusedTokens: true,
    smartCompoundVariants: true,
    treeshakeDesignSystem: true,
  },
  outdir: "styled-system",
  patterns: {
    extend: {
      between,
      hoverShadow,
    },
  },
  preflight: true,
  presets: [presetBase, presetPanda],
  // Useful for theme customization
  theme: {
    extend: {
      containerNames: ["clientTotals", "item-row"],
      containers: {
        xs: "20ch",
        md: "28rem",
        xl: "36rem",
        "2xl": "42rem",
      },
      keyframes,
      semanticTokens,
      tokens,
    },
  },
});
