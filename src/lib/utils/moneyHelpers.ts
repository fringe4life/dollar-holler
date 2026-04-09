import type { LineItem } from "$lib/db/schema";
import type { InvoiceSelect } from "$lib/features/invoices/types";
import type { NewLineItemWithId } from "$lib/features/line-items/types";
import type { List, Maybe } from "$lib/types";

/**
 * @abstract calculates the cost of a part of the invoice
 * @param {List<LineItem>} lineItems found on Invoices
 * @returns {number} the sum cost of the invoice
 */
export const sumLineItems = (
  lineItems: List<LineItem | NewLineItemWithId>
): number => {
  if (!lineItems) return 0;

  return lineItems.reduce((acc, cur) => {
    if (Number.isNaN(cur.amount)) {
      return acc;
    }
    return (acc += cur.amount);
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
  return centsToDollars(isNaN(total) ? 0 : total);
};

/**
 * @abstract returns the sum of the line items (uses getTotal with lineItems)
 * @param {List<InvoiceSelect>} invoices invoices with lineItems
 * @returns {number} the sum of all the Invoices in cents
 */
export const sumInvoices = (invoices: List<InvoiceSelect>): number => {
  if (!invoices) return 0;
  return invoices.reduce((acc, cur) => (acc += getTotal(cur)), 0);
};

/**
 * @abstract returns the sum of pre-computed totals (for InvoiceListResponse etc.)
 * @param {List<{ total?: number }>} invoices invoices with total property
 * @returns {number} the sum of all invoice totals in cents
 */
export const sumInvoiceTotals = <T extends { total?: number }>(
  invoices: List<T>
): number => {
  if (!invoices) return 0;
  return invoices.reduce((acc, cur) => acc + (cur.total ?? 0), 0);
};

/**
 * @abstract turns money amounts expressed in dollars into money expressed in cents
 * @param {number} dollars the amount of dollars to be converted into cents
 * @returns {number} the money in cents
 */
export const dollarsToCents = (dollars: number): number => {
  return dollars * 100;
};

/**
 * @abstract provides the total cost of the invoice (subtotal - discount)
 * @param {Invoice} invoice the invoice to get the total for (may have lineItems)
 * @returns {number} total in cents
 */
export const getTotal = (
  invoice: Maybe<InvoiceSelect & { lineItems?: List<LineItem> }>
): number => {
  if (!invoice) {
    return 0;
  }

  const sum = sumLineItems(invoice.lineItems);
  const discount = invoice.discount ? sum * (invoice.discount / 100) : 0;
  const final = sum - discount;
  if (isNaN(final)) return 0;
  return final;
};
