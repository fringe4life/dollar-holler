import { writable } from 'svelte/store'
import type { Client } from '../../global'
import data from '../../seed.json'

export const clients = writable<Client[]>([])

export const loadClients = () => {
  // @ts-expect-error type wrong will be supabase eventually
  clients.set(data.clients)
}

export const addClient = (clientToAdd: Client) => {
  clients.update(prev => [...prev, clientToAdd])
  return clientToAdd
}

export const updateClient = (clientToUpdate: Client) => {
  clients.update(prev => prev.map(c => (c.id === clientToUpdate.id ? clientToUpdate : c)))
  return clientToUpdate
}

export const getClientById = (id: string): Client | undefined => {
  return data.clients.find(client => client.id === id) as Client | undefined
}
