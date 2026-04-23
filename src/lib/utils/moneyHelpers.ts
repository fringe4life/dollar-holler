import type {
  LineItemEditRow,
  NewLineItemWithId,
} from "$features/line-items/types";
import type { List, Maybe } from "$lib/types";

/**
 * @abstract calculates the cost of a part of the invoice
 * @param {List<LineItemEditRow>} lineItems found on Invoices
 * @returns {number} the sum cost of the invoice
 */
export const sumLineItems = (
  lineItems: List<LineItemEditRow | NewLineItemWithId>
): number => {
  if (!lineItems) {
    return 0;
  }

  return lineItems.reduce((acc, cur) => {
    if (Number.isNaN(cur.amount)) {
      return acc;
    }
    return acc + cur.amount;
  }, 0);
};
const MONEY_FORMATTER = new Intl.NumberFormat("en", {
  style: "currency",
  currency: "USD",
});
/**
 * @abstract turns cent based money amounts into dollars
 * @param {number} cents the cents to be turned into a dollar amount
 * @returns {string} formatted currency string
 */
export const centsToDollars = (cents: Maybe<number>): string => {
  if (!cents) {
    return MONEY_FORMATTER.format(0);
  }
  return MONEY_FORMATTER.format(cents / 100);
};

/**
 * @abstract formats a pre-computed total (in cents) for display, optionally applying discount
 * @param {number} totalOrSubtotal total in cents, or subtotal if discountPercent provided
 * @param {Maybe<number>} discountPercent optional discount percentage (0-100)
 * @returns {string} formatted currency string
 */
export const formatTotal = (
  totalOrSubtotal: number,
  discountPercent?: Maybe<number>
): string => {
  const total =
    discountPercent && discountPercent > 0
      ? totalOrSubtotal - totalOrSubtotal * (discountPercent / 100)
      : totalOrSubtotal;
  return centsToDollars(Number.isNaN(total) ? 0 : total);
};
