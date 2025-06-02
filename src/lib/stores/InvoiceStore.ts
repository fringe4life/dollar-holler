import { writable } from 'svelte/store'
import type { Invoice } from '../../global'
import data from '../../seed.json'
export const invoices = writable<Invoice[]>([])

export const loadInvoices = () => {
  invoices.set(data.invoices)
  // invoices.set([])
}
