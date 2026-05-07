import { css } from "styled-system/css";
import { grid } from "styled-system/patterns";

export const actionButton = grid({
  justifyItems: "center",
  fontWeight: "bold",
  color: "daisyBush",
});

export const invoiceRow = grid({
  gridTemplateAreas: {
    base: '"invoicenumber invoicenumber" "clientName    amount" "duedate       status"',
    lg: '"status duedate invoicenumber clientName amount view threeDots"',
  },
});

export const invoiceTable = grid({
  gridTemplateColumns: {
    base: "1fr max-content",
    lg: "max-content 100px 100px max-content 1fr 32px 32px",
  },
  columnGap: 4,
  paddingInline: { base: 4, lg: 6 },
  inlineSize: "full",
});

export const tableRowHover = css({
  transitionProperty: "translate",
  transitionDuration: "normal",
  transitionTimingFunction: "anticipate",
  position: "relative",
  _after: {
    content: '""',
    position: "absolute",
    inset: 0,
    opacity: 0,
    zIndex: -1,
    borderRadius: "lg",
    boxShadow: "tableRowHover",
    transitionProperty: "opacity",
    transitionDuration: "normal",
    transitionTimingFunction: "anticipate",
  },
  _hover: {
    translate: "0 -2px",
    _after: {
      opacity: "1",
    },
  },
});

export const tableRowBase = css({
  alignItems: "center",
  rounded: "lg",
  backgroundColor: "white",
  paddingBlock: { base: 3, lg: 6 },
  shadow: "tableRow",
});

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

export const authHeading = css({
  color: "goldenFizz",
  marginBlockEnd: 4,
  fontSize: "4xl",
  fontWeight: "black",
});
