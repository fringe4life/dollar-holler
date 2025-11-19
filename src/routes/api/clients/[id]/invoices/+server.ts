import { db } from '$lib/db'
import { invoices as invoicesTable } from '$lib/db/schema'
import { json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  try {
    const invoices = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.clientId, params.id))

    return json(invoices)
  } catch (error) {
    console.error('Error loading client invoices:', error)
    return json({ error: 'Failed to load client invoices' }, { status: 500 })
  }
}
