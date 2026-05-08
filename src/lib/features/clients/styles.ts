import { grid } from "styled-system/patterns";

export const clientTable = grid({
  gridTemplateColumns: {
    base: "1fr 90px",
    lg: "70px 1fr 125px 125px 32px 32px",
  },
  columnGap: 4,
  paddingInline: { base: 4, lg: 6 },
  inlineSize: "full",
});

export const clientRow = grid({
  gridTemplateAreas: {
    base: '"clientName status" "received balance"',
    lg: '"status clientName received balance view threeDots"',
  },
});
