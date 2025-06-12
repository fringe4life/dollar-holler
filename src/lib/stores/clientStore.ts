import { writable } from 'svelte/store'
import type { Client } from '../../global'
import { supabase } from '$lib/utils/supabase'
import { toast } from 'svelte-sonner'

export const clients = writable<Client[]>([])

export const loadClients = async () => {
  const { data: client, error } = await supabase
    .from('client')
    .select('*, invoice(id, invoiceStatus, lineItems(*))')
  // clients.set(data.clients)
  if (error) {
    console.error(error.message)
    return
  }
  clients.set(client)
}

export const addClient = async (clientToAdd: Omit<Client, 'id'>) => {
  console.log(clientToAdd)
  const { data: client, error } = await supabase
    .from('client')
    .insert([{ ...clientToAdd, clientStatus: 'active' }])
    .select()

  if (error) {
    console.error(error.message)
    toast.error(error.message)
  }

  const id = client?.at(0).id
  console.log(id)
  clients.update(prev => [...prev, { ...clientToAdd, clientStatus: 'active', id }])
  return id
}

export const updateClient = async (clientToUpdate: Client) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { invoice, ...newClient } = clientToUpdate

  const { error } = await supabase.from('client').update(newClient).eq('id', newClient.id)

  if (error) {
    toast.error(error.message)
    return
  }

  clients.update(prev => prev.map(c => (c.id === clientToUpdate.id ? clientToUpdate : c)))
  return clientToUpdate
}

/**
 * @abstract returns a Client or undefined wrapped in a promise based on the id provided
 * @param {string} id the ID of the client
 * @returns {Promise<Client | undefined>} returns a promise of a Client if found otherwise undefined
 */
export const getClientById = async (id: string): Promise<Client | undefined> => {
  const { data: client, error } = await supabase
    .from('client')
    .select('*, invoice( client(id, name), id, invoiceStatus, dueDate, invoiceNumber,lineItems(*))')
    .eq('id', id)
  if (error) {
    console.error(error.message)
    return
  }
  return client.at(0) as Client | undefined
  // return data.clients.find(client => client.id === id) as Client | undefined
}

export const deleteClient = async (clientToDelete: Client) => {
  const { error } = await supabase.from('client').delete().eq('id', clientToDelete.id)

  if (error) {
    toast.error(error.message)
    return
  }
  clients.update(prevClients =>
    prevClients.filter(prevClient => prevClient.id !== clientToDelete.id)
  )
}
