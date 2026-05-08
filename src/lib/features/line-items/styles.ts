import { grid } from "styled-system/patterns";

export const invoiceLineItem = grid({
  gridTemplateAreas: {
    base: '"description description description" "unitPrice   quantity    amount"',
    sm: '"description unitPrice quantity amount trash"',
    _print: '"description unitPrice quantity amount trash"',
  },
  gridTemplateColumns: {
    sm: "1fr 100px 100px 100px 65px",
  },
  columnGap: { base: 2, md: 5 },
  position: "relative",
});
