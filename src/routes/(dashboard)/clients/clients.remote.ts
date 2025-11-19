import { query } from '$app/server'
import { db } from '$lib/db'
import { clients as clientsTable } from '$lib/db/schema'
export const loadClients = query(async () => {
  const clients = await db.select().from(clientsTable)
  return clients
})
