import { browser } from '$app/environment'
import { Zero } from '@rocicorp/zero'
import { schema, type Schema } from '../../../zero-schema.gen'
import type { Mutators } from './mutators'
import { createMutators } from './mutators'

let zeroInstance: Zero<Schema, Mutators> | null = null

export function getZeroInstance(
  userID: string | null | undefined,
  authToken?: string | null
): Zero<Schema, Mutators> {
  // Create singleton instance - reuse if already created
  if (zeroInstance && browser) {
    return zeroInstance
  }

  if (!browser) {
    throw new Error('Zero client should only be initialized on the client side')
  }

  // Use a fallback userID if none provided (for anonymous users)
  const effectiveUserID = userID || 'anonymous'
  const server = import.meta.env.VITE_PUBLIC_ZERO_SERVER || '/api/zero'

  zeroInstance = new Zero<Schema, Mutators>({
    schema,
    userID: effectiveUserID,
    auth: authToken || undefined,
    server,
    mutators: createMutators(),
  })

  return zeroInstance
}
