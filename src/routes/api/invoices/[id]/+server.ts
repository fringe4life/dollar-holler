import { db } from '$lib/db'
import { invoices as invoicesTable } from '$lib/db/schema'
import { json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  try {
    const invoice = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, params.id))
      .limit(1)

    if (invoice.length === 0) {
      return json({ error: 'Invoice not found' }, { status: 404 })
    }

    return json(invoice[0])
  } catch (error) {
    console.error('Error loading invoice:', error)
    return json({ error: 'Failed to load invoice' }, { status: 500 })
  }
}

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const invoiceData = await request.json()
    const { lineItems, client, ...updateData } = invoiceData

    const [updated] = await db
      .update(invoicesTable)
      .set({
        ...updateData,
        clientId: client?.id,
        updatedAt: new Date(),
      })
      .where(eq(invoicesTable.id, params.id))
      .returning()

    return json(updated)
  } catch (error) {
    console.error('Error updating invoice:', error)
    return json({ error: 'Failed to update invoice' }, { status: 500 })
  }
}

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    await db.delete(invoicesTable).where(eq(invoicesTable.id, params.id))
    return json({ success: true })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    return json({ error: 'Failed to delete invoice' }, { status: 500 })
  }
}
