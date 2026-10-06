import { css, cx } from "#styled-system/css/index.js";
import { cq, grid, gridItem, hstack } from "#styled-system/patterns/index.js";

export const invoiceSummaryContainerClass = cx(
  css({ marginBlockEnd: 10 }),
  cq({ name: "clientTotals" })
);

export const invoiceSummaryCardClass = css({
  backgroundColor: "surfaceSecondary",
  borderColor: "borderSubtle",
  borderRadius: "lg",
  borderStyle: "solid",
  borderWidth: "1px",
  boxShadow: "colored",
  overflow: "hidden",
});

export const invoiceSummaryListClass = grid({
  gap: 0,
  gridTemplateAreas: {
    base: '"overdue" "outstanding" "draft" "paid"',
    "@clientTotals/md": '"overdue overdue overdue" "outstanding draft paid"',
    "@clientTotals/2xl": '"overdue outstanding" "overdue draft" "overdue paid"',
  },
  gridTemplateColumns: {
    base: "minmax(0, 1fr)",
    "@clientTotals/md": "repeat(3, minmax(0, 1fr))",
    "@clientTotals/2xl": "minmax(0, 0.8fr) minmax(0, 1.2fr)",
  },
  gridTemplateRows: {
    "@clientTotals/md": "auto auto",
    "@clientTotals/2xl": "repeat(3, minmax(0, 39px))",
  },
  margin: 0,
});

export const invoiceSummaryItemBaseClass = css({ minInlineSize: 0 });

export const invoiceSummaryItemClass = hstack({
  alignItems: {
    base: "center",
    "@clientTotals/md": "flex-start",
    "@clientTotals/2xl": "center",
  },
  borderBlockEndColor: "borderSubtle",
  borderBlockEndStyle: "solid",
  borderBlockEndWidth: {
    base: "1px",
    "@clientTotals/md": 0,
    "@clientTotals/2xl": "1px",
  },
  borderInlineEndColor: "borderSubtle",
  borderInlineEndStyle: "solid",
  borderInlineEndWidth: {
    base: 0,
    "@clientTotals/md": "1px",
    "@clientTotals/2xl": 0,
  },
  flexDirection: {
    base: "row",
    "@clientTotals/md": "column",
    "@clientTotals/2xl": "row",
  },
  gap: { base: 3, "@clientTotals/md": 0.5, "@clientTotals/2xl": 3 },
  justify: "space-between",
  minBlockSize: { "@clientTotals/md": 16, "@clientTotals/2xl": 9.75 },
  paddingBlock: { base: 3, "@clientTotals/md": 2, "@clientTotals/2xl": 1.75 },
  paddingInline: { base: 4, "@clientTotals/md": 3, "@clientTotals/2xl": 5.5 },
  _last: {
    borderBlockEndWidth: 0,
    "@clientTotals/md": { borderInlineEndWidth: 0 },
  },
});

export const invoiceSummaryOverdueClass = cx(
  gridItem({ gridArea: "overdue" }),
  hstack({
    alignItems: { base: "center", "@clientTotals/2xl": "flex-start" },
    backgroundColor: "statusLate/10",
    borderBlockEndColor: "borderSubtle",
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: {
      base: "1px",
      "@clientTotals/md": "1px",
      "@clientTotals/2xl": 0,
    },
    borderInlineEndColor: "borderSubtle",
    borderInlineEndStyle: "solid",
    borderInlineEndWidth: { "@clientTotals/2xl": "1px" },
    flexDirection: { base: "row", "@clientTotals/2xl": "column" },
    gap: { base: 3, "@clientTotals/md": 3, "@clientTotals/2xl": 1.5 },
    justify: { base: "space-between", "@clientTotals/2xl": "center" },
    minBlockSize: { "@clientTotals/md": 14, "@clientTotals/2xl": 34 },
    paddingBlock: { base: 3, "@clientTotals/md": 2.5, "@clientTotals/2xl": 5 },
    paddingInline: { base: 4, "@clientTotals/md": 4.5, "@clientTotals/2xl": 7 },
    "& dt": { color: "foreground" },
    "& dd": {
      color: "statusLate",
      fontSize: "xl",
      fontWeight: "bold",
      letterSpacing: "tight",
      "@clientTotals/md": { fontSize: "2xl", textAlign: "right" },
      "@clientTotals/2xl": { fontSize: "4xl", textAlign: "left" },
    },
    "& > div:first-of-type": {
      blockSize: 4,
      inlineSize: "34%",
      maxInlineSize: "12rem",
      "@clientTotals/md": { inlineSize: "30%" },
      "@clientTotals/2xl": { inlineSize: "48%", maxInlineSize: "10rem" },
    },
    "& > div:last-of-type": {
      blockSize: 8,
      inlineSize: "26%",
      maxInlineSize: "12rem",
      "@clientTotals/md": { inlineSize: "24%" },
      "@clientTotals/2xl": {
        blockSize: 12,
        inlineSize: "74%",
        maxInlineSize: "15rem",
      },
    },
  })
);

export const invoiceSummaryOutstandingClass = cx(
  invoiceSummaryItemClass,
  gridItem({ gridArea: "outstanding" })
);

export const invoiceSummaryDraftClass = cx(
  invoiceSummaryItemClass,
  gridItem({ gridArea: "draft" })
);

export const invoiceSummaryPaidClass = cx(
  invoiceSummaryItemClass,
  gridItem({ gridArea: "paid" })
);

export const invoiceSummaryLabelClass = css({
  color: "metricLabel",
  fontSize: "sm",
  fontWeight: "semibold",
  lineHeight: "snug",
  minInlineSize: 0,
  overflowWrap: "anywhere",
});

export const invoiceSummaryAmountClass = css({
  color: "foreground",
  flexShrink: 0,
  fontSize: "md",
  fontVariantNumeric: "tabular-nums",
  fontWeight: "semibold",
  lineHeight: "tight",
  margin: 0,
  textAlign: "right",
  whiteSpace: "nowrap",
  "@clientTotals/md": { fontSize: "md", textAlign: "left" },
  "@clientTotals/2xl": { fontSize: "lg", textAlign: "right" },
});

export const invoiceSummarySkeletonLabelClass = css({
  backgroundColor: "skeletonSubtle/40",
  blockSize: 4,
  inlineSize: "58%",
  maxInlineSize: "9rem",
  "@clientTotals/md": { inlineSize: "62%", maxInlineSize: "8rem" },
  "@clientTotals/2xl": { inlineSize: "54%", maxInlineSize: "9rem" },
});

export const invoiceSummarySkeletonAmountClass = css({
  backgroundColor: "skeletonSubtle/40",
  blockSize: 6,
  inlineSize: "32%",
  maxInlineSize: "7rem",
  "@clientTotals/md": { inlineSize: "50%" },
  "@clientTotals/2xl": { blockSize: 7, inlineSize: "28%" },
});
