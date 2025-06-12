import { writable } from 'svelte/store'
import type { Invoice, LineItem } from '../../global'
import { supabase } from '$lib/utils/supabase'
import { toast } from 'svelte-sonner'
export const invoices = writable<Invoice[]>([])

export const loadInvoices = async () => {
  const { data: invoice, error } = await supabase
    .from('invoice')
    .select('*, client( id, name), lineItems(*)')
  console.log(invoice)
  if (error) {
    console.error(error.message)
    return
  }
  invoices.set(invoice as Invoice[])
  // invoices.set([])
}

export const deleteInvoice = async (invoice: Invoice) => {
  // delete all lineItems
  const isSuccessful = deleteLineItems(invoice.id)

  if (!isSuccessful) {
    return
  }
  // delete the invoice
  const { error } = await supabase.from('invoice').delete().eq('id', invoice.id)

  if (error) {
    toast.error(error.message)
    return
  }

  // update our store
  invoices.update(prev => prev.filter(i => i.id !== invoice.id))
  toast.success('Successfully deleted your invoice')
  return invoice
}

export const addInvoice = async (invoiceToAdd: Invoice) => {
  //add invoice to supabase
  const { lineItems, client, ...newInvoice } = invoiceToAdd
  // get the invoice id
  const { data, error } = await supabase
    .from('invoice')
    .insert([{ ...newInvoice, clientId: client.id }])
    .select()
  //loop over all line items and add invoice id
  if (error) {
    console.error(error.message)
    toast.error(error.message)
    return
  }
  // add lineItems to supabase
  const invoiceId = data.at(0).id
  const invoiceStatus = data.at(0).invoiceStatus
  // update the store

  const isSuccessful = await addLineItems(lineItems, invoiceId)
  if (!isSuccessful) return

  // update the store
  invoices.update(prev => [...prev, { ...invoiceToAdd, id: invoiceId, invoiceStatus }])
  return invoiceToAdd
}

const addLineItems = async (lineItems: LineItem[] | undefined, invoiceId: string) => {
  let isSuccessful = true
  if (lineItems && lineItems.length > 0) {
    const newLineItems = lineItems.map(lineItem => ({ ...lineItem, invoiceId }))

    const { error: lineItemError } = await supabase.from('lineItems').insert(newLineItems)

    if (lineItemError) {
      toast.error(lineItemError.message)
      isSuccessful = false
    }
  }
  return isSuccessful
}

const deleteLineItems = async (invoiceId: string): Promise<boolean> => {
  let isSuccessful = true
  const { error } = await supabase.from('lineItems').delete().eq('invoiceId', invoiceId)

  if (error) {
    toast.error(error.message)
    isSuccessful = false
  }
  return isSuccessful
}

export const updateInvoice = async (invoiceToUpdate: Invoice) => {
  const { lineItems, client, ...updatedInvoice } = invoiceToUpdate

  // delete all lineItems
  let isSuccessful = await deleteLineItems(invoiceToUpdate.id)
  if (!isSuccessful) return
  // add new lineitems
  isSuccessful = await addLineItems(lineItems, invoiceToUpdate.id)
  if (!isSuccessful) return
  // update invoice at supabase
  const { error } = await supabase
    .from('invoice')
    .update({ ...updatedInvoice, clientId: client.id })
    .eq('id', invoiceToUpdate.id)

  if (error) {
    toast.error(error.message)
    return
  }
  // update the store
  invoices.update(prev =>
    prev.map(i => {
      if (i.id === invoiceToUpdate.id) {
        console.log('found invoice')
        return invoiceToUpdate
      }
      return i
    })
  )
  toast.success('Invoice Updated')
  return invoiceToUpdate
}

export const getInvoiceById = async (id: string): Promise<Invoice | undefined> => {
  const { data: invoice, error } = await supabase
    .from('invoice')
    .select('*, client(name, id), lineItems(*)')
    .eq('id', id)
  // return data.invoices.find(invoice => invoice.id === id) as Invoice | undefined
  if (error) {
    console.error(error.message)
    return
  }
  if (invoice && invoice.at(0)) return invoice.at(0) as Invoice
}
