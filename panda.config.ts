import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,
  // Where to look for your css declarations
  include: ["./src/**/*.svelte", "./src/**/*.ts", "./src/**/*.js"],
  // Files to exclude
  exclude: [],
  conditions: {
    extend: {
      supportsScroll: "@supports (animation-timeline: scroll())",
      notSupportsScroll: "@supports not (animation-timeline: scroll())",
      supportsLinear: "@supports (animation-timing-function: linear(0, 1))",
      notSupportsLinear:
        "@supports not (animation-timing-function: linear(0, 1))",
      peerNotExpanded: "&[aria-expanded='false'] ~ *",
      groupDataExpanded: ".group[data-expanded='true'] &",
    },
  },
  // Useful for theme customization
  theme: {
    containerSizes: { xs: "20ch" },
    extend: {
      keyframes: {
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
        "slide-down": {
          to: {
            translate: "0 var(--slide-distance)",
          },
        },
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
      },
      tokens: {
        colors: {
          lavenderIndigo: { value: "oklch(57.85% 0.2 295.07)" },
          daisyBush: { value: "oklch(38.26% 0.202 288.17)" },
          goldenFizz: { value: "oklch(96.89% 0.195 109.86)" },
          whisper: { value: "oklch(97.24% 0.008 325.64)" },
          pastelPurple: { value: "oklch(73.19% 0.041 314.06)" },
          purple: { value: "oklch(44.68% 0.228 304.02)" },
          robinEggBlue: { value: "oklch(83.31% 0.159 173.79)" },
          blueGem: { value: "oklch(36.17% 0.199 281.88)" },
          caribbeanGreen: { value: "oklch(74.62% 0.148 169.83)" },
          scarlet: { value: "oklch(63.44% 0.231 22.02)" },
          monsoon: { value: "oklch(57.18% 0.001 197.12)" },
          silver: { value: "oklch(80.78% 0 0)" },
          gallery: { value: "oklch(94.32% 0.012 313.21)" },
          fog: { value: "oklch(86.6% 0.051 311.45)" },
          white: { value: "oklch(100% 0 0)" },
          prim: { value: "oklch(86.75% 0.022 318.96)" },
          lightGray: { value: "oklch(69.39% 0.034 309.79)" },
        },
        shadows: {
          tableRow: { value: "0 0 6px oklch(0% 0 none / 0.16)" },
          tableRowHover: {
            value: "0 4px 14px oklch(38.26% 0.202 288.17 / 0.15)",
          },
          colored: { value: "0 7px 16px oklch(57.4% 0.189 292 / 0.02)" },
          coloredHover: { value: "0 7px 16px oklch(57.4% 0.189 292 / 0.3)" },
          addInvoice: { value: "-4px 0px 44px oklch(0% 0 none / 0.25)" },
        },
        easings: {
          dramatic: {
            value:
              "linear(0, 0.618 4.6%, 1.072 9.7%, 1.358 15.3%, 1.446 18.4%, 1.497 21.7%, 1.512 23.9%, 1.514 26.2%, 1.481 31.5%, 1.421 36.4%, 1.174 53.4%, 1.108 59.5%, 1.059 65.7%, 1.028 71.9%, 1.009 78.9%, 1.000 100%)",
          },
          glide: {
            value:
              "linear(0, 0.012 0.9%, 0.05 2%, 0.411 9.2%, 0.517 11.8%, 0.611 14.6%, 0.694 17.7%, 0.765 21.1%, 0.824 24.8%, 0.872 28.9%, 0.91 33.4%, 0.939 38.4%, 0.977 50.9%, 0.994 68.4%, 1.000 100%)",
          },
          subtle: {
            value:
              "linear(0, 0.618 4.6%, 1.072 9.7%, 1.358 15.3%, 1.446 18.4%, 1.497 21.7%, 1.512 23.9%, 1.514 26.2%, 1.481 31.5%, 1.421 36.4%, 1.174 53.4%, 1.108 59.5%, 1.059 65.7%, 1.028 71.9%, 1.009 78.9%, 1.000 100%)",
          },
          smooth: {
            value:
              "linear(0, 0.618 4.6%, 1.072 9.7%, 1.358 15.3%, 1.446 18.4%, 1.497 21.7%, 1.512 23.9%, 1.514 26.2%, 1.481 31.5%, 1.421 36.4%, 1.174 53.4%, 1.108 59.5%, 1.059 65.7%, 1.028 71.9%, 1.009 78.9%, 1.000 100%)",
          },
          gentle: {
            value:
              "linear(0, 0.618 4.6%, 1.072 9.7%, 1.358 15.3%, 1.446 18.4%, 1.497 21.7%, 1.512 23.9%, 1.514 26.2%, 1.481 31.5%, 1.421 36.4%, 1.174 53.4%, 1.108 59.5%, 1.059 65.7%, 1.028 71.9%, 1.009 78.9%, 1.000 100%)",
          },
          elastic: {
            value:
              "linear(0, 0.029 1.6%, 0.123 3.5%, 0.651 10.6%, 0.862 14.1%, 1.002 17.7%, 1.046 19.6%, 1.074 21.6%, 1.087 23.9%, 1.086 26.6%, 1.014 38.5%, 0.994 46.3%, 1.000 100%)",
          },
          anticipate: {
            value: "cubic-bezier(0.8, -0.4, 0.5, 1)",
          },
        },
        fonts: {
          sansserif: { value: "Source Sans 3, sans-serif" },
          mono: { value: "Source Code Pro, monospace" },
          handwriting: { value: "Kalam, cursive" },
        },
      },
    },
  },

  globalCss: {
    label: {
      fontFamily: "sansserif",
      color: "monsoon",
      display: "block",
      // fontSize: "base",
      fontWeight: "bold",
    },
    "input[type='number']::-webkit-inner-spin-button": {
      margin: "0",
      appearance: "none",
    },
    "input[type='number']::-webkit-outer-spin-button": {
      margin: "0",
      appearance: "none",
    },
    "input[type='number']": {
      appearance: "textfield",
    },
    svg: {
      fill: "currentColor",
    },
    body: {
      fontFamily: "sansserif",
    },
    html: {
      scrollbarGutter: "stable",
    },
  },
  minify: true,
  // The output directory for your css system
  outdir: "styled-system",
  patterns: {
    extend: {
      between: {
        description:
          "a flex box that aligns items to center and justifies between",
        transform(properties) {
          return {
            display: "flex",
            alignItems: "center",
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
            position: "relative",
            _after: {
              content: '""',
              position: "absolute",
              inset: "0",
              rounded: "inherit",
              opacity: "0",
              boxShadow: shadow,
              transitionProperty: "opacity",
              transitionDuration: "normal",
              zIndex: -1,
            },
            _hover: {
              _after: {
                opacity: "1",
              },
            },
          };
        },
      },
    },
  },
  // plugins: [pluginSvelte()],
});
