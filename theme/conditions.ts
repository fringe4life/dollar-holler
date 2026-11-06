import { defineConditions } from "@pandacss/dev";

export const conditions = defineConditions({
  extend: {
    dark: {
      "[data-theme=dark] &": "@slot",
      "@media (prefers-color-scheme: dark)": {
        ":root:not([data-theme=light]) &": "@slot",
      },
    },
    groupDataExpanded: ".group[data-expanded='true'] &",
    groupHasToastHover: ".group:has([popover='manual']:hover) &",
    // Chrome still matches `:hover` on a disabled button, so a glyph inside one
    // would animate on a control that cannot be used. `:where()` keeps this at
    // the specificity of a plain group hover, so press states still win.
    groupHoverEnabled: ":where(.group):hover:not(:disabled) &",
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
