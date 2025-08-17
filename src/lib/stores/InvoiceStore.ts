import { writable } from 'svelte/store'
import { db } from '$lib/db'
import { invoices as invoicesTable, clients as clientsTable, lineItems as lineItemsTable } from '$lib/db/schema'
import { eq } from 'drizzle-orm'
import { toast } from 'svelte-sonner'
import type { Invoice, LineItem, Client } from '$lib/db/schema'

// Extended types for the store
interface InvoiceWithRelations extends Invoice {
  client: Client
  lineItems: LineItem[]
}

export const invoices = writable<InvoiceWithRelations[]>([])

export const loadInvoices = async () => {
  try {
    const invoiceData = await db
      .select()
      .from(invoicesTable)
      .leftJoin(clientsTable, eq(invoicesTable.clientId, clientsTable.id))
      .leftJoin(lineItemsTable, eq(invoicesTable.id, lineItemsTable.invoiceId))

    // Transform the data to match the expected Invoice structure
    const transformedInvoices = invoiceData.reduce((acc, row) => {
      const existingInvoice = acc.find(i => i.id === row.invoices.id)
      if (existingInvoice) {
        if (row.line_items && !existingInvoice.lineItems?.find((li: LineItem) => li.id === row.line_items!.id)) {
          existingInvoice.lineItems = [...(existingInvoice.lineItems || []), row.line_items!]
        }
      } else {
        acc.push({
          ...row.invoices,
          client: row.clients!,
          lineItems: row.line_items ? [row.line_items] : []
        } as InvoiceWithRelations)
      }
      return acc
    }, [] as InvoiceWithRelations[])

    invoices.set(transformedInvoices)
  } catch (error) {
    console.error('Error loading invoices:', error)
  }
}

export const deleteInvoice = async (invoice: Invoice) => {
  try {
    // Delete all line items first
    await db
      .delete(lineItemsTable)
      .where(eq(lineItemsTable.invoiceId, invoice.id))

    // Delete the invoice
    await db
      .delete(invoicesTable)
      .where(eq(invoicesTable.id, invoice.id))

    // Update our store
    invoices.update(prev => prev.filter(i => i.id !== invoice.id))
    toast.success('Successfully deleted your invoice')
    return invoice
  } catch (error) {
    console.error('Error deleting invoice:', error)
    toast.error('Failed to delete invoice')
  }
}

export const addInvoice = async (invoiceToAdd: InvoiceWithRelations) => {
  try {
    const { lineItems, client, ...newInvoice } = invoiceToAdd
    const invoiceId = crypto.randomUUID()
    
    // Add invoice to database
    await db.insert(invoicesTable).values({
      ...newInvoice,
      id: invoiceId,
      clientId: client.id
    })

    // Add line items
    if (lineItems && lineItems.length > 0) {
      const newLineItems = lineItems.map((lineItem: LineItem) => ({
        ...lineItem,
        id: crypto.randomUUID(),
        invoiceId
      }))

      await db.insert(lineItemsTable).values(newLineItems)
    }

    // Update the store
    const newInvoiceWithId = { ...invoiceToAdd, id: invoiceId }
    invoices.update(prev => [...prev, newInvoiceWithId])
    return newInvoiceWithId
  } catch (error) {
    console.error('Error adding invoice:', error)
    toast.error('Failed to add invoice')
  }
}

export const updateInvoice = async (invoiceToUpdate: InvoiceWithRelations) => {
  try {
    const { lineItems, client, ...updatedInvoice } = invoiceToUpdate

    // Delete all line items
    await db
      .delete(lineItemsTable)
      .where(eq(lineItemsTable.invoiceId, invoiceToUpdate.id))

    // Add new line items
    if (lineItems && lineItems.length > 0) {
      const newLineItems = lineItems.map((lineItem: LineItem) => ({
        ...lineItem,
        id: crypto.randomUUID(),
        invoiceId: invoiceToUpdate.id
      }))

      await db.insert(lineItemsTable).values(newLineItems)
    }

    // Update invoice
    await db
      .update(invoicesTable)
      .set({ ...updatedInvoice, clientId: client.id })
      .where(eq(invoicesTable.id, invoiceToUpdate.id))

    // Update the store
    invoices.update(prev =>
      prev.map(i => {
        if (i.id === invoiceToUpdate.id) {
          return invoiceToUpdate
        }
        return i
      })
    )
    toast.success('Invoice Updated')
    return invoiceToUpdate
  } catch (error) {
    console.error('Error updating invoice:', error)
    toast.error('Failed to update invoice')
  }
}

export const getInvoiceById = async (id: string): Promise<InvoiceWithRelations | undefined> => {
  try {
    const invoiceData = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, id))
      .leftJoin(clientsTable, eq(invoicesTable.clientId, clientsTable.id))
      .leftJoin(lineItemsTable, eq(invoicesTable.id, lineItemsTable.invoiceId))

    if (invoiceData.length === 0) return undefined

    // Transform the data to match the expected Invoice structure
    const invoice = invoiceData[0].invoices
    const client = invoiceData[0].clients!
    const lineItems = invoiceData
      .filter(row => row.line_items)
      .map(row => row.line_items!)

    return {
      ...invoice,
      client,
      lineItems
    } as InvoiceWithRelations
  } catch (error) {
    console.error('Error getting invoice by ID:', error)
    return undefined
  }
}
