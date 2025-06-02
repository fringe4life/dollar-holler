import type { Invoice, LineItem } from '../../global'

export const sumLineItems = (lineItems: LineItem[] | undefined): number => {
  if (!lineItems) return 0

  return lineItems.reduce((acc, cur) => {
    return (acc += cur.amount * cur.quantity)
  }, 0)
}

export const centsToDollars = (cents: number): string => {
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency: 'NZD'
    // notation: 'standard'
  }).format(cents / 100)
}

export const sumInvoices = (invoices: Invoice[] | undefined) => {
  console.log(invoices)
  if (!invoices) return 0
  return invoices.reduce((acc, cur) => (acc += sumLineItems(cur.lineItems)), 0)
}
