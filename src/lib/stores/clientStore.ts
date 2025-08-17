import { writable } from 'svelte/store'
import { db } from '$lib/db'
import { clients as clientsTable, invoices as invoicesTable, lineItems as lineItemsTable } from '$lib/db/schema'
import { eq } from 'drizzle-orm'
import { toast } from 'svelte-sonner'
import type { Client } from '$lib/db/schema'

export const clients = writable<Client[]>([])

export const loadClients = async () => {
  try {
    const clientData = await db
      .select()
      .from(clientsTable)
      .leftJoin(invoicesTable, eq(clientsTable.id, invoicesTable.clientId))
      .leftJoin(lineItemsTable, eq(invoicesTable.id, lineItemsTable.invoiceId))

    // Transform the data to match the expected Client structure
    const transformedClients = clientData.reduce((acc, row) => {
      const existingClient = acc.find(c => c.id === row.clients.id)
      if (existingClient) {
        if (row.invoices && !existingClient.invoice?.find(i => i.id === row.invoices.id)) {
          existingClient.invoice = [...(existingClient.invoice || []), row.invoices]
        }
      } else {
        acc.push({
          ...row.clients,
          invoice: row.invoices ? [row.invoices] : []
        })
      }
      return acc
    }, [] as Client[])

    clients.set(transformedClients)
  } catch (error) {
    console.error('Error loading clients:', error)
  }
}

export const addClient = async (clientToAdd: Omit<Client, 'id'>) => {
  try {
    const id = crypto.randomUUID()
    const newClient = { ...clientToAdd, id, clientStatus: 'active' }
    
    await db.insert(clientsTable).values(newClient)
    
    clients.update(prev => [...prev, newClient])
    return id
  } catch (error) {
    console.error('Error adding client:', error)
    toast.error('Failed to add client')
  }
}

export const updateClient = async (clientToUpdate: Client) => {
  try {
    const { invoice, ...newClient } = clientToUpdate
    
    await db
      .update(clientsTable)
      .set(newClient)
      .where(eq(clientsTable.id, newClient.id))

    clients.update(prev => prev.map(c => (c.id === clientToUpdate.id ? clientToUpdate : c)))
    return clientToUpdate
  } catch (error) {
    console.error('Error updating client:', error)
    toast.error('Failed to update client')
  }
}

export const getClientById = async (id: string): Promise<Client | undefined> => {
  try {
    const clientData = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, id))
      .leftJoin(invoicesTable, eq(clientsTable.id, invoicesTable.clientId))
      .leftJoin(lineItemsTable, eq(invoicesTable.id, lineItemsTable.invoiceId))

    if (clientData.length === 0) return undefined

    // Transform the data to match the expected Client structure
    const client = clientData[0].clients
    const invoices = clientData
      .filter(row => row.invoices)
      .map(row => row.invoices)
      .reduce((acc, invoice) => {
        const existing = acc.find(i => i.id === invoice.id)
        if (!existing) {
          acc.push({
            ...invoice,
            client: { id: client.id, name: client.name },
            lineItems: clientData
              .filter(row => row.lineItems && row.invoices?.id === invoice.id)
              .map(row => row.lineItems)
          })
        }
        return acc
      }, [] as any[])

    return {
      ...client,
      invoice: invoices
    }
  } catch (error) {
    console.error('Error getting client by ID:', error)
    return undefined
  }
}

export const deleteClient = async (clientToDelete: Client) => {
  try {
    await db
      .delete(clientsTable)
      .where(eq(clientsTable.id, clientToDelete.id))

    clients.update(prevClients =>
      prevClients.filter(prevClient => prevClient.id !== clientToDelete.id)
    )
  } catch (error) {
    console.error('Error deleting client:', error)
    toast.error('Failed to delete client')
  }
}
