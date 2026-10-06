import { css } from "#styled-system/css/index.js";

export const features = [
  {
    description:
      "Add the work, client details, and the notes that matter to you. Shape each invoice as you go.",
    mark: css({ backgroundColor: "featurePrimary" }),
    offset: css({ marginBlockStart: { base: 0, md: 0, lg: 0 } }),
    title: "Make invoices your way",
  },
  {
    description:
      "Find the people you work with and their details alongside the invoices you make for them.",
    mark: css({ backgroundColor: "warning", rotate: "4deg", width: 9 }),
    offset: css({ marginBlockStart: { base: 0, md: 6, lg: 6 } }),
    title: "Keep client info close",
  },
  {
    description:
      "Mark an invoice Draft, Sent, or Paid when you’re ready. You’re always in charge of its status.",
    mark: css({
      backgroundColor: "featureSuccess",
      rotate: "-1deg",
      width: 14,
    }),
    offset: css({ marginBlockStart: { base: 0, md: 12, lg: 12 } }),
    title: "Know where things stand",
  },
] as const;
