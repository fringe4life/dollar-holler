import type { Invoice, LineItem } from '../../global'

/**
 * @abstract calculates the cost of a part of the invoice
 * @param {LineItem[] | undefined} lineItems found on Invoices
 * @returns {number} the sum cost of the invoice
 */
export const sumLineItems = (lineItems: LineItem[] | undefined): number => {
  if (!lineItems) return 0

  return lineItems.reduce((acc, cur) => {
    if (Number.isNaN(cur.amount)) {
      return acc
    }
    return (acc += cur.amount)
  }, 0)
}
/**
 * @abstract turns cent based money amounts into dollars
 * @param {number} cents the cents to be turned into a dollar amount
 * @returns {number} the amount of dollars based on the initial received cents
 */
export const centsToDollars = (cents: number): string => {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'USD'
  }).format(cents)
}

/**
 * @abstract returns the sum of the line items
 * @param {Invoice[]} invoices
 * @returns {number} the sum of all the Invoices
 */
export const sumInvoices = (invoices: Invoice[] | undefined): number => {
  if (!invoices) return 0
  return invoices.reduce((acc, cur) => (acc += sumLineItems(cur.lineItems)), 0)
}

/**
 * @abstract turns money amounts expressed in dollars into money expressed in cents
 * @param {number} dollars the amount of dollars to be converted into cents
 * @returns {number} the money in cents
 */
export const dollarsToCents = (dollars: number): number => {
  return dollars * 100
}
