import { defineConditions } from "@pandacss/dev";

export const conditions = defineConditions({
  extend: {
    dark: {
      ".dark &": "@slot",
      "@media (prefers-color-scheme: dark)": {
        ":root:not(.light) &": "@slot",
      },
    },
    groupDataExpanded: ".group[data-expanded='true'] &",
    groupHasToastHover: ".group:has([popover='manual']:hover) &",
    hoverNone: "@media (hover: none)",
    notSupportsLinear:
      "@supports not (animation-timing-function: linear(0, 1))",
    notSupportsScroll: "@supports not (animation-timeline: scroll())",
    ariaInvalid: "&[aria-invalid='true']",
    peerNotExpanded: "&[aria-expanded='false'] ~ *",
    supportsBaseSelect: "@supports (appearance: base-select)",
    supportsLinear: "@supports (animation-timing-function: linear(0, 1))",
    supportsScroll: "@supports (animation-timeline: scroll())",
    supportsViewTimeline: "@supports (animation-timeline: view())",
  },
});
