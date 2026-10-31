import { cva } from "#styled-system/css/index.js";
import { grid } from "#styled-system/patterns/index.js";

const invoiceColumns = {
  base: "minmax(0, 1fr) max-content",
  "@item-row/xl": "max-content 12ch 12ch minmax(0, 1fr) max-content",
} as const;

export const invoiceTable = grid({
  columnGap: { base: 3, "@item-row/xl": 4 },
  gridTemplateColumns: invoiceColumns,
  inlineSize: "full",
  minInlineSize: 0,
  paddingInline: { base: 3, "@item-row/xl": 4 },
});

export const invoiceRow = grid({
  alignItems: "center",
  columnGap: { base: 3, "@item-row/xl": 4 },
  gridTemplateAreas: {
    base: '"invoicenumber amount" "clientName amount" "duedate status" "swipeHint swipeHint" "actions actions"',
    "@item-row/xl":
      '"status duedate invoicenumber clientName amount" "actions actions actions actions actions"',
  },
  gridTemplateColumns: invoiceColumns,
  inlineSize: "full",
  minInlineSize: 0,
  paddingBlock: { base: 3, "@item-row/md": 3.5, "@item-row/xl": 3 },
  rowGap: { base: 1, "@item-row/md": 2, "@item-row/xl": 2 },
});

export const invoiceIdentity = grid({
  alignContent: "center",
  gap: 0.5,
  gridArea: "invoicenumber",
  minInlineSize: 0,
});

export const invoiceNumber = grid({
  color: "textMuted",
  fontSize: "xs",
  fontVariantNumeric: "tabular-nums",
  fontWeight: "semibold",
  letterSpacing: "wide",
  lineHeight: "tight",
  minInlineSize: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  "@item-row/xl": {
    fontSize: "sm",
  },
});

export const invoiceClientName = grid({
  color: "foreground",
  fontSize: { base: "lg", "@item-row/md": "xl", "@item-row/xl": "lg" },
  fontWeight: "black",
  gridArea: "clientName",
  letterSpacing: "tight",
  lineHeight: "tight",
  minInlineSize: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const invoiceDueDate = grid({
  alignItems: "baseline",
  color: "textMuted",
  columnGap: 1.5,
  display: "flex",
  fontSize: "sm",
  fontVariantNumeric: "tabular-nums",
  gridArea: "duedate",
  minInlineSize: 0,
  whiteSpace: "nowrap",
  "& span": {
    color: "textMuted",
    fontSize: "2xs",
    fontWeight: "bold",
    letterSpacing: "wider",
    textTransform: "uppercase",
  },
  "@item-row/xl": {
    alignItems: "flex-start",
    flexDirection: "column",
    fontSize: "sm",
    gap: 0.5,
  },
});

export const invoiceAmount = grid({
  color: "foreground",
  fontSize: { base: "2xl", "@item-row/md": "3xl", "@item-row/xl": "xl" },
  fontWeight: "black",
  gridArea: "amount",
  justifyItems: "end",
  letterSpacing: "tight",
  lineHeight: "none",
  whiteSpace: "nowrap",
});

export const invoiceStatus = grid({
  gridArea: "status",
  justifyItems: "end",
  "@item-row/xl": { justifyItems: "start" },
});

export const invoiceSwipeHint = grid({
  alignItems: "center",
  borderBlockStartColor: "borderSubtle",
  borderBlockStartStyle: "dashed",
  borderBlockStartWidth: "1px",
  color: "mutedAction",
  display: "flex",
  fontSize: "2xs",
  fontWeight: "bold",
  gridArea: "swipeHint",
  justifyContent: "space-between",
  letterSpacing: "wider",
  minInlineSize: 0,
  paddingBlockStart: 1.5,
  textTransform: "uppercase",
  "@item-row/md": { display: "none" },
});

export const invoiceStateSignal = cva({
  base: {
    isolation: "isolate",
    position: "relative",
    borderColor: "borderSubtle",
    _before: {
      clipPath: "polygon(0 0, 100% 0, 100% 100%)",
      content: '""',
      height: 3,
      insetBlockStart: 0,
      insetInlineEnd: 0,
      position: "absolute",
      width: 3,
      zIndex: 1,
    },
  },
  variants: {
    state: {
      draft: {
        borderColor: "statusDraft/50",
        _before: { backgroundColor: "statusDraft" },
        _hover: { borderColor: "statusDraft" },
        _dark: {
          borderColor: "statusDraft/45",
          _hover: { borderColor: "statusDraft" },
        },
      },
      late: {
        borderColor: "statusLate/50",
        _before: { backgroundColor: "statusLate" },
        _hover: { borderColor: "statusLate" },
        _dark: {
          borderColor: "statusLate/45",
          _hover: { borderColor: "statusLate" },
        },
      },
      paid: {
        borderColor: "statusPaid/50",
        _before: { backgroundColor: "statusPaid" },
        _hover: { borderColor: "statusPaid" },
        _dark: {
          borderColor: "statusPaid/45",
          _hover: { borderColor: "statusPaid" },
        },
      },
      sent: {
        borderColor: "statusSent/50",
        _before: { backgroundColor: "statusSent" },
        _hover: { borderColor: "statusSent" },
        _dark: {
          borderColor: "statusSent/45",
          _hover: { borderColor: "statusSent" },
        },
      },
    },
  },
});
