import { browser } from '$app/environment'
import { Zero } from '@rocicorp/zero'
import { getContext, setContext } from 'svelte'
import type { Schema } from '../../../zero-schema.gen'
import type { Mutators } from './mutators'

const ZERO_CONTEXT_KEY = Symbol('zero')

export function setZeroContext(zero: Zero<Schema, Mutators>) {
  setContext(ZERO_CONTEXT_KEY, zero)
}

export function getZeroContext(): Zero<Schema, Mutators> {
  const zero = getContext<Zero<Schema, Mutators>>(ZERO_CONTEXT_KEY)
  if (!zero) {
    throw new Error('Zero context not found. Make sure ZeroProvider is set up.')
  }
  return zero
}

/**
 * Svelte 5 rune-based hook for using Zero queries reactively
 * Uses $state and $effect for idiomatic Svelte 5 reactivity
 *
 * @example
 * ```svelte
 * <script>
 *   import { useZeroQuery } from '$lib/zero/svelte'
 *   import { getZeroContext } from '$lib/zero/svelte'
 *
 *   const zero = getZeroContext()
 *   const clients = useZeroQuery(() => zero.query.clients.where('userId', user.id))
 * </script>
 *
 * {#each clients as client}
 *   <div>{client.name}</div>
 * {/each}
 * ```
 */
export function useZeroQuery<T>(queryFn: () => unknown) {
  if (!browser) {
    return $state([] as T)
  }

  // Create reactive state using $state rune
  const data = $state([] as T)

  // Set up effect to materialize and listen to query
  $effect(() => {
    const zero = getZeroContext()
    const query = queryFn()

    // Materialize the query into a view
    const view = zero.materialize(query)

    // Set up listener for updates - use a function that updates the reactive state
    const listener = (newData: unknown) => {
      // Update the reactive state array/object by replacing contents
      if (Array.isArray(data)) {
        data.length = 0
        Array.prototype.push.apply(data, newData as T[])
      } else {
        // For objects, we need to copy properties
        Object.assign(data as object, newData as object)
      }
    }

    view.addListener(listener)

    // Cleanup is automatic - Zero views are cleaned up when out of scope
    return () => {
      // Zero views are automatically cleaned up
    }
  })

  return data
}

/**
 * Alternative approach: Create a rune-based store that returns a $state object
 * This is useful if you want more control or need to destructure
 *
 * @example
 * ```svelte
 * <script>
 *   import { createZeroState } from '$lib/zero/svelte'
 *   import { getZeroContext } from '$lib/zero/svelte'
 *
 *   const zero = getZeroContext()
 *   const clientsState = createZeroState(() => zero.query.clients)
 * </script>
 *
 * {#each clientsState.data as client}
 *   <div>{client.name}</div>
 * {/each}
 * ```
 */
export function createZeroState<T>(queryFn: () => unknown) {
  if (!browser) {
    return {
      data: $state<T>([] as T),
      loading: $state(false),
      error: $state<Error | null>(null),
    }
  }

  const state = $state({
    data: [] as T,
    loading: true as boolean,
    error: null as Error | null,
  })

  $effect(() => {
    const zero = getZeroContext()
    const query = queryFn()

    try {
      const view = zero.materialize(query)

      const listener = (newData: unknown, resultType?: string, error?: unknown) => {
        if (resultType === 'error' && error) {
          state.error = error instanceof Error ? error : new Error(String(error))
          state.loading = false
        } else {
          state.data = newData as T
          state.loading = false
          state.error = null
        }
      }

      view.addListener(listener)

      return () => {
        // Cleanup
      }
    } catch (err) {
      state.error = err instanceof Error ? err : new Error(String(err))
      state.loading = false
    }
  })

  return state
}
