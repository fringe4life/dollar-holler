import { writable } from 'svelte/store'
import type { Client } from '../../global'
import data from '../../seed.json'

export const clients = writable<Client[]>([])

export const loadClients = () => {
  clients.set(data.clients)
}

export const addClient = (clientToAdd: Client) => {
  clients.update(prev => [...prev, clientToAdd])
  return clientToAdd
}
