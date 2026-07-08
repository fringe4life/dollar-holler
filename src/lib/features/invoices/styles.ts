import { grid } from "styled-system/patterns";

export const invoiceRow = grid({
  gap: 0,
  gridTemplateAreas: {
    base: '"invoicenumber invoicenumber" "clientName amount" "duedate status"',
    lg: '"status duedate invoicenumber clientName amount view threeDots"',
  },
});

export const invoiceTable = grid({
  columnGap: 4,
  gridTemplateColumns: {
    base: "1fr max-content",
    lg: "max-content 12ch 12ch max-content 1fr 32px 32px",
  },
  inlineSize: "full",
  paddingInline: { base: 4, lg: 6 },
});
