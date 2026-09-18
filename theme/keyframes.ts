import { defineKeyframes } from "@pandacss/dev";

export const keyframes = defineKeyframes({
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
  "rotate-reveal": {
    "0%": {
      rotate: "var(--rotate-distance)",
    },
    "50%": {
      rotate: "0deg",
    },
    "100%": {
      rotate: "calc(var(--rotate-distance) * -1)",
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
  "slide-out-reverse": {
    to: {
      translate: "calc(var(--slide-distance) * -1) 0",
    },
  },
  "slide-up": {
    from: {
      translate: "0 var(--slide-distance)",
    },
  },
});
