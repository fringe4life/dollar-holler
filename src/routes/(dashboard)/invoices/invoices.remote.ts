import { query } from '$app/server'
import { db } from '$lib/db'
import { invoices as invoicesTable } from '$lib/db/schema'
export const loadClients = query(async () => {
  const invoices = await db.select().from(invoicesTable)
  return invoices
})
