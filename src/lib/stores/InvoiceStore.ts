import { writable } from 'svelte/store'
import type { Invoice } from '../../global'
import data from '../../seed.json'
export const invoices = writable<Invoice[]>([])

export const loadInvoices = () => {
  // @ts-expect-error it works well enough for now
  invoices.set(data.invoices)
  // invoices.set([])
}

export const deleteInvoice = (invoice: Invoice) => {
  invoices.update(prev => prev.filter(i => i.id !== invoice.id))
  return invoice
}

export const addInvoice = (invoiceToAdd: Invoice) => {
  invoices.update(prev => [...prev, invoiceToAdd])
  return invoiceToAdd
}

export const updateInvoice = (invoiceToUpdate: Invoice) => {
  invoices.update(prev =>
    prev.map(i => {
      if (i.id === invoiceToUpdate.id) {
        console.log('found invoice')
        return invoiceToUpdate
      }
      return i
    })
  )
  return invoiceToUpdate
}

export const getInvoiceById = (id: string): Invoice | undefined => {
  return data.invoices.find(invoice => invoice.id === id) as Invoice | undefined
}
