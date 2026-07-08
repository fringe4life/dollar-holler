import { grid } from "styled-system/patterns";

export const clientTable = grid({
  columnGap: 4,
  gridTemplateColumns: {
    base: "1fr 90px",
    lg: "70px 1fr 125px 125px 32px 32px",
  },
  inlineSize: "full",
  paddingInline: { base: 4, lg: 6 },
});

export const clientRow = grid({
  gap: 0,
  gridTemplateAreas: {
    base: '"clientName status" "received balance"',
    lg: '"status clientName received balance view threeDots"',
  },
});
