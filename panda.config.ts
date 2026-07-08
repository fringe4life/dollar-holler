import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  conditions: {
    extend: {
      groupDataExpanded: ".group[data-expanded='true'] &",
      notSupportsLinear:
        "@supports not (animation-timing-function: linear(0, 1))",
      notSupportsScroll: "@supports not (animation-timeline: scroll())",
      peerNotExpanded: "&[aria-expanded='false'] ~ *",
      supportsLinear: "@supports (animation-timing-function: linear(0, 1))",
      supportsScroll: "@supports (animation-timeline: scroll())",
    },
  },
  // Files to exclude
  exclude: [],

  globalCss: {
    body: {
      fontFamily: "sansserif",
    },
    html: {
      scrollbarGutter: "stable",
    },
    "input[type='number']": {
      appearance: "textfield",
    },
    "input[type='number']::-webkit-inner-spin-button": {
      appearance: "none",
      margin: "0",
    },
    "input[type='number']::-webkit-outer-spin-button": {
      appearance: "none",
      margin: "0",
    },
    label: {
      color: "monsoon",
      display: "block",
      fontFamily: "sansserif",
      // fontSize: "base",
      fontWeight: "bold",
    },
    svg: {
      fill: "currentColor",
    },
  },
  // Where to look for your css declarations
  include: ["./src/**/*.svelte", "./src/**/*.ts", "./src/**/*.js"],
  minify: true,
  optimize: {
    removeUnusedKeyframes: true,
    removeUnusedTokens: true,
    smartCompoundVariants: true,
  },
  outdir: "styled-system",
  patterns: {
    extend: {
      between: {
        description:
          "a flex box that aligns items to center and justifies between",
        transform(properties) {
          return {
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            ...properties,
          };
        },
      },
      hoverShadow: {
        description:
          "reveals a box shadow via an ::after pseudo-element on hover",
        properties: {
          shadow: { type: "token", value: "shadows" },
        },
        transform({ shadow }) {
          return {
            _after: {
              boxShadow: shadow,
              content: '""',
              inset: "0",
              opacity: "0",
              position: "absolute",
              rounded: "inherit",
              transitionDuration: "normal",
              transitionProperty: "opacity",
              zIndex: -1,
            },
            _hover: {
              _after: {
                opacity: "1",
              },
            },
            position: "relative",
          };
        },
      },
    },
  },
  preflight: true,
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
  // Useful for theme customization
  theme: {
    containerSizes: { xs: "20ch" },
    extend: {
      keyframes: {
        "fade-in": {
          from: {
            opacity: "0",
          },
        },
        "fade-out": {
          to: {
            opacity: "0",
          },
        },
        "slide-down": {
          to: {
            translate: "0 var(--slide-distance)",
          },
        },
        "slide-in": {
          from: {
            translate: "var(--slide-distance) 0",
          },
        },
        "slide-out": {
          to: {
            translate: "var(--slide-distance) 0",
          },
        },
        "slide-up": {
          from: {
            translate: "0 var(--slide-distance)",
          },
        },
      },
      tokens: {
        colors: {
          blueGem: { value: "oklch(36.17% 0.199 281.88)" },
          caribbeanGreen: { value: "oklch(74.62% 0.148 169.83)" },
          daisyBush: { value: "oklch(38.26% 0.202 288.17)" },
          fog: { value: "oklch(86.6% 0.051 311.45)" },
          gallery: { value: "oklch(94.32% 0.012 313.21)" },
          goldenFizz: { value: "oklch(96.89% 0.195 109.86)" },
          lavenderIndigo: { value: "oklch(57.85% 0.2 295.07)" },
          lightGray: { value: "oklch(69.39% 0.034 309.79)" },
          monsoon: { value: "oklch(57.18% 0.001 197.12)" },
          pastelPurple: { value: "oklch(73.19% 0.041 314.06)" },
          prim: { value: "oklch(86.75% 0.022 318.96)" },
          purple: { value: "oklch(44.68% 0.228 304.02)" },
          robinEggBlue: { value: "oklch(83.31% 0.159 173.79)" },
          scarlet: { value: "oklch(63.44% 0.231 22.02)" },
          silver: { value: "oklch(80.78% 0 0)" },
          whisper: { value: "oklch(97.24% 0.008 325.64)" },
          white: { value: "oklch(100% 0 0)" },
        },
        easings: {
          anticipate: {
            value: "cubic-bezier(0.8, -0.4, 0.5, 1)",
          },
          dramatic: {
            value:
              "linear(0, 0.618 4.6%, 1.072 9.7%, 1.358 15.3%, 1.446 18.4%, 1.497 21.7%, 1.512 23.9%, 1.514 26.2%, 1.481 31.5%, 1.421 36.4%, 1.174 53.4%, 1.108 59.5%, 1.059 65.7%, 1.028 71.9%, 1.009 78.9%, 1.000 100%)",
          },
          elastic: {
            value:
              "linear(0, 0.029 1.6%, 0.123 3.5%, 0.651 10.6%, 0.862 14.1%, 1.002 17.7%, 1.046 19.6%, 1.074 21.6%, 1.087 23.9%, 1.086 26.6%, 1.014 38.5%, 0.994 46.3%, 1.000 100%)",
          },
          gentle: {
            value:
              "linear(0, 0.618 4.6%, 1.072 9.7%, 1.358 15.3%, 1.446 18.4%, 1.497 21.7%, 1.512 23.9%, 1.514 26.2%, 1.481 31.5%, 1.421 36.4%, 1.174 53.4%, 1.108 59.5%, 1.059 65.7%, 1.028 71.9%, 1.009 78.9%, 1.000 100%)",
          },
          glide: {
            value:
              "linear(0, 0.012 0.9%, 0.05 2%, 0.411 9.2%, 0.517 11.8%, 0.611 14.6%, 0.694 17.7%, 0.765 21.1%, 0.824 24.8%, 0.872 28.9%, 0.91 33.4%, 0.939 38.4%, 0.977 50.9%, 0.994 68.4%, 1.000 100%)",
          },
          smooth: {
            value:
              "linear(0, 0.618 4.6%, 1.072 9.7%, 1.358 15.3%, 1.446 18.4%, 1.497 21.7%, 1.512 23.9%, 1.514 26.2%, 1.481 31.5%, 1.421 36.4%, 1.174 53.4%, 1.108 59.5%, 1.059 65.7%, 1.028 71.9%, 1.009 78.9%, 1.000 100%)",
          },
          subtle: {
            value:
              "linear(0, 0.618 4.6%, 1.072 9.7%, 1.358 15.3%, 1.446 18.4%, 1.497 21.7%, 1.512 23.9%, 1.514 26.2%, 1.481 31.5%, 1.421 36.4%, 1.174 53.4%, 1.108 59.5%, 1.059 65.7%, 1.028 71.9%, 1.009 78.9%, 1.000 100%)",
          },
        },
        fonts: {
          handwriting: { value: "Kalam, cursive" },
          mono: { value: "Source Code Pro, monospace" },
          sansserif: { value: "Source Sans 3 Variable, sans-serif" },
        },
        shadows: {
          addInvoice: { value: "-4px 0px 44px oklch(0% 0 none / 0.25)" },
          colored: { value: "0 7px 16px oklch(57.4% 0.189 292 / 0.02)" },
          coloredHover: { value: "0 7px 16px oklch(57.4% 0.189 292 / 0.3)" },
          tableRow: { value: "0 0 6px oklch(0% 0 none / 0.16)" },
          tableRowHover: {
            value: "0 4px 14px oklch(38.26% 0.202 288.17 / 0.15)",
          },
        },
      },
    },
  },
});
