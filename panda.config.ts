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
    // Typed view-transition CSS (PaginatedList) names theme keyframes from raw
    // <style> blocks. Panda extract never sees those refs, so tree-shake drops
    // fade-in / fade-out / slide-in / slide-out and pagination anims no-op.
    removeUnusedKeyframes: false,
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
    containerSizes: { xs: "20ch" },
    extend: {
      keyframes,
      semanticTokens,
      tokens,
    },
  },
});
