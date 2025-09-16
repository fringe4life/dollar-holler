<script lang="ts">
  import ModalE from '$lib/components/ModalE.svelte'
  import { Button } from '$lib/components/ui/button'
  import type { MouseEventHandler } from 'svelte/elements'

  import type { Client } from '$lib/db/schema'
  import { deleteClient } from '$lib/stores/clientStore.svelte'

  type Props = {
    open: boolean
    client: Client
  }

  const handleDelete: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = async () => {
    open = false
    await deleteClient(client)
  }

  let { client, open = $bindable() }: Props = $props()
</script>

<ModalE bind:open buttonText="" className="z-450">
  {#snippet title()}
    <h2 class="text-daisyBush text-center text-xl font-bold">
      Are you sure you want to delete this invoice?
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="text-daisyBush text-center text-lg font-medium">
      This will delete the Client called: <span class="text-scarlet">{client.name}</span> for
    </h2>
  {/snippet}

  <div class="flex justify-center gap-4">
    <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
    <Button variant="destructive" onclick={handleDelete}>Yes, Delete It.</Button>
  </div>
</ModalE>
