import { grid } from "#styled-system/patterns/index.js";

export const invoiceLineItem = grid({
  columnGap: { base: 2, md: 5 },
  gap: 0,
  gridTemplateAreas: {
    _print: '"description unitPrice quantity amount trash"',
    base: '"description description description" "unitPrice quantity amount"',
    sm: '"description unitPrice quantity amount trash"',
  },
  gridTemplateColumns: {
    sm: "1fr 100px 100px 100px 65px",
  },
  position: "relative",
});

const invoiceLineItemSummaryBase = {
  columnGap: { base: 2, md: 5 },
  gap: 0,
  gridTemplateColumns: {
    sm: "1fr 100px 100px 100px 65px",
  },
  position: "relative",
} as const;

export const invoiceLineItemSubtotal = grid({
  ...invoiceLineItemSummaryBase,
  gridTemplateAreas: {
    _print: '"subtotal subtotal subtotal amount ."',
    base: '"addLineItem subtotal amount"',
    sm: '"addLineItem addLineItem subtotal amount ."',
  },
});

export const invoiceLineItemDiscount = grid({
  ...invoiceLineItemSummaryBase,
  gridTemplateAreas: {
    _print: '"discountLabel discountLabel discountLabel discountInput amount"',
    base: '"discountLabel discountInput amount"',
    sm: '"discountLabel discountLabel discountInput amount ."',
  },
});
