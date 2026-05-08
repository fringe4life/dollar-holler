import { grid } from "styled-system/patterns";

export const invoiceRow = grid({
  gridTemplateAreas: {
    base: '"invoicenumber invoicenumber" "clientName    amount" "duedate       status"',
    lg: '"status duedate invoicenumber clientName amount view threeDots"',
  },
});

export const invoiceTable = grid({
  gridTemplateColumns: {
    base: "1fr max-content",
    lg: "max-content 12ch 12ch max-content 1fr 32px 32px",
  },
  columnGap: 4,
  paddingInline: { base: 4, lg: 6 },
  inlineSize: "full",
});
