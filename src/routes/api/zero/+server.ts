import { createMutators } from '$lib/zero/mutators'
import { PushProcessor } from '@rocicorp/zero/server'
import { zeroNodePg } from '@rocicorp/zero/server/adapters/pg'
import type { RequestEvent } from '@sveltejs/kit'
import { json } from '@sveltejs/kit'
import { Pool } from 'pg'
import { schema } from '../../../../zero-schema.gen'
import type { RequestHandler } from './$types'

// Create a connection pool for Zero
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

// Initialize Zero server adapter
const db = zeroNodePg(schema, pool)

// Create push processor
const processor = new PushProcessor(db)

export const POST: RequestHandler = async (event: RequestEvent) => {
  try {
    // Get user from session for authorization
    const user = event.locals.user

    if (!user) {
      return json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create mutators with auth context
    const mutators = createMutators()

    // Process the push request
    const result = await processor.process(
      mutators,
      event.url.searchParams,
      await event.request.json()
    )

    return json(result)
  } catch (error) {
    console.error('Zero push error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle GET queries endpoint
export const GET: RequestHandler = async (_: RequestEvent) => {
  try {
    // Zero typically uses POST for queries, but we can support GET if needed
    // For now, redirect to POST handler logic
    return json({ error: 'Use POST for queries' }, { status: 405 })
  } catch (error) {
    console.error('Zero query error:', error)
    return json({ error: 'Internal server error' }, { status: 500 })
  }
}
