import { cva } from "#styled-system/css/index.js";
import { grid } from "#styled-system/patterns/index.js";

const clientColumns = {
  base: "minmax(0, 1fr) max-content",
  "@item-row/xl":
    "max-content minmax(0, 1.15fr) minmax(8rem, 0.9fr) minmax(8rem, 0.9fr)",
} as const;

export const clientTable = grid({
  columnGap: { base: 3, "@item-row/xl": 4 },
  gridTemplateColumns: clientColumns,
  inlineSize: "full",
  minInlineSize: 0,
  paddingInline: { base: 3, "@item-row/xl": 4 },
});

export const clientRow = grid({
  alignItems: "center",
  columnGap: { base: 3, "@item-row/xl": 4 },
  gridTemplateAreas: {
    base: '"clientName status" "received balance" "swipeHint swipeHint" "actions actions"',
    "@item-row/xl":
      '"status clientName received balance" "actions actions actions actions"',
  },
  gridTemplateColumns: clientColumns,
  inlineSize: "full",
  minInlineSize: 0,
  paddingBlock: { base: 3, "@item-row/md": 3.5, "@item-row/xl": 3 },
  rowGap: { base: 2, "@item-row/md": 2.5, "@item-row/xl": 2 },
});

export const clientName = grid({
  color: "foreground",
  fontSize: { base: "lg", "@item-row/md": "2xl", "@item-row/xl": "lg" },
  fontWeight: "black",
  gridArea: "clientName",
  letterSpacing: "tight",
  lineHeight: "tight",
  minInlineSize: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

export const clientStatus = grid({
  gridArea: "status",
  justifyItems: "end",
  "@item-row/xl": { justifyItems: "start" },
});

export const clientReceived = grid({
  alignItems: "baseline",
  columnGap: 1.5,
  display: "flex",
  fontSize: { base: "sm", "@item-row/md": "lg", "@item-row/xl": "md" },
  fontVariantNumeric: "tabular-nums",
  fontWeight: "bold",
  gridArea: "received",
  minInlineSize: 0,
  whiteSpace: "nowrap",
  "& span": {
    color: "textMuted",
    fontSize: "2xs",
    fontWeight: "bold",
    letterSpacing: "wider",
    textTransform: "uppercase",
  },
});

export const clientBalance = grid({
  alignItems: "baseline",
  columnGap: 1.5,
  color: "destructive",
  display: "flex",
  fontSize: { base: "sm", "@item-row/md": "lg", "@item-row/xl": "md" },
  fontVariantNumeric: "tabular-nums",
  fontWeight: "bold",
  gridArea: "balance",
  justifyContent: "end",
  minInlineSize: 0,
  whiteSpace: "nowrap",
  "& span": {
    color: "textMuted",
    fontSize: "2xs",
    fontWeight: "bold",
    letterSpacing: "wider",
    textTransform: "uppercase",
  },
  "@item-row/xl": { justifyContent: "start" },
});

export const clientSwipeHint = grid({
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

export const clientStateSignal = cva({
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
      active: {
        borderColor: "success/45",
        _before: { backgroundColor: "success" },
        _hover: { borderColor: "success" },
        _dark: {
          borderColor: "success/35",
          _hover: { borderColor: "success" },
        },
      },
      archive: {
        borderColor: "textMuted/45",
        _before: { backgroundColor: "textMuted" },
        _hover: { borderColor: "textMuted" },
        _dark: {
          borderColor: "textMuted/35",
          _hover: { borderColor: "textMuted" },
        },
      },
    },
  },
});
