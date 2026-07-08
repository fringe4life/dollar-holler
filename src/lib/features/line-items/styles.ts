import { grid } from "styled-system/patterns";

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
