import { defineGlobalStyles } from "@pandacss/dev";

export const globalCss = defineGlobalStyles({
  // Typed pagination VT — document-level; viewTransition() has no types API.
  // animationName refs keep theme keyframes alive under removeUnusedKeyframes.
  ":active-view-transition-type(backward)": {
    "&::view-transition-new(paginated-list-rows)": {
      "--slide-distance": "-60px",
      animationDuration: "250ms",
      animationFillMode: "both",
      animationName: "fade-in, slide-in",
    },
    "&::view-transition-old(paginated-list-rows)": {
      "--slide-distance": "calc(100vw + 60px)",
      animationDuration: "250ms",
      animationFillMode: "both",
      animationName: "fade-out, slide-out",
    },
  },
  ":active-view-transition-type(forward)": {
    "&::view-transition-new(paginated-list-rows)": {
      "--slide-distance": "calc(100vw + 60px)",
      animationDuration: "250ms",
      animationFillMode: "both",
      animationName: "fade-in, slide-in",
    },
    "&::view-transition-old(paginated-list-rows)": {
      "--slide-distance": "-60px",
      animationDuration: "250ms",
      animationFillMode: "both",
      animationName: "fade-out, slide-out",
    },
  },
  /*
   * Theme-change VT new snapshot — names theme-circle-reveal so extract keeps it.
   * Kept under no-preference so UA `animation: none !important` wins for reduce.
   * Group/old plumbing stays in app.css (no theme keyframe names).
   */
  "@media (prefers-reduced-motion: no-preference)": {
    ":active-view-transition-type(theme-change)::view-transition-new(theme)": {
      animationDuration: "500ms",
      animationFillMode: "both",
      animationName: "theme-circle-reveal",
      animationTimingFunction: "glide",
      display: "block",
      mixBlendMode: "normal",
    },
  },
  body: {
    backgroundColor: "background",
    color: "foreground",
    fontFamily: "sansserif",
  },
  html: {
    colorScheme: "light dark",
    scrollbarGutter: "stable",
    // Attribute on `:root`, or `:has` if `data-theme` is on a descendant.
    "&[data-theme=dark], &:has([data-theme=dark])": {
      colorScheme: "dark",
    },
    "&[data-theme=light], &:has([data-theme=light])": {
      colorScheme: "light",
    },
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
    color: "textMuted",
    display: "block",
    fontFamily: "sansserif",
    fontWeight: "bold",
  },
  svg: {
    fill: "currentColor",
  },
});
