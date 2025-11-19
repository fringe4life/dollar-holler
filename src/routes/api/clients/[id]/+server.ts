import { db } from '$lib/db'
import { clients as clientsTable } from '$lib/db/schema'
import { json } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import type { RequestHandler } from './$types'

export const GET: RequestHandler = async ({ params }) => {
  try {
    const client = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, params.id))
      .limit(1)

    if (client.length === 0) {
      return json({ error: 'Client not found' }, { status: 404 })
    }

    return json(client[0])
  } catch (error) {
    console.error('Error loading client:', error)
    return json({ error: 'Failed to load client' }, { status: 500 })
  }
}

export const PUT: RequestHandler = async ({ params, request }) => {
  try {
    const clientData = await request.json()

    const [updated] = await db
      .update(clientsTable)
      .set({
        ...clientData,
        updatedAt: new Date(),
      })
      .where(eq(clientsTable.id, params.id))
      .returning()

    return json(updated)
  } catch (error) {
    console.error('Error updating client:', error)
    return json({ error: 'Failed to update client' }, { status: 500 })
  }
}

export const DELETE: RequestHandler = async ({ params }) => {
  try {
    await db.delete(clientsTable).where(eq(clientsTable.id, params.id))
    return json({ success: true })
  } catch (error) {
    console.error('Error deleting client:', error)
    return json({ error: 'Failed to delete client' }, { status: 500 })
  }
}
