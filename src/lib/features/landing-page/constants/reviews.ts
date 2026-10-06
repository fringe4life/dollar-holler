import { css } from "#styled-system/css/index.js";

export const reviews = [
  {
    name: "Alex",
    quote:
      "I can put an invoice together without losing track of all the little details.",
    role: "independent designer",
    rotate: css({ rotate: "-1deg" }),
    surface: css({ backgroundColor: "landingQuotePaper" }),
  },
  {
    name: "Jordan",
    quote: "It’s nice having my client notes and invoices in one place.",
    role: "freelance illustrator",
    rotate: css({ rotate: "1deg" }),
    surface: css({ backgroundColor: "warning" }),
  },
] as const;
