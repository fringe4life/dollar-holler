<script lang="ts">
  import { onMount, onDestroy, type Snippet } from 'svelte'
  import { setZeroContext } from './svelte'
  import { getZeroInstance } from './client'
  import type { Zero } from '@rocicorp/zero'
  import type { Schema } from '../../../zero-schema.gen'
  import type { Mutators } from './mutators'

  interface Props {
    userID?: string | null
    authToken?: string | null
    children: Snippet
  }

  let { userID, authToken, children }: Props = $props()

  let zero: Zero<Schema, Mutators> | null = $state(null)

  onMount(() => {
    zero = getZeroInstance(userID, authToken)
    setZeroContext(zero)
  })

  onDestroy(() => {
    // Cleanup if needed
  })
</script>

{#if zero}
  {@render children()}
{:else}
  <div>Loading Zero...</div>
{/if}
