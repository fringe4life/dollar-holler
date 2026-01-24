<script lang="ts">
  import Modal from '$lib/components/Modal.svelte'
  import { Button } from '$lib/components/ui/button'
  import { invoicesStore } from '$lib/stores/invoicesStore.svelte'
  import { centsToDollars, sumLineItems } from '$lib/utils/moneyHelpers'
  import type { MouseEventHandler } from 'svelte/elements'

  import type { NewInvoice } from '$lib/db/schema'
  import { toast } from 'svelte-sonner'

  type Props = {
    open: boolean
    invoice: NewInvoice
  }

  const handleDelete: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = async () => {
    open = false
    if (!invoice.id) {
      toast.error('Invoice not found')
      return
    }
    await deleteInvoice(invoice.id)
  }

  let { invoice, open = $bindable() }: Props = $props()
</script>

<Modal bind:open buttonText="" className="z-450">
  {#snippet title()}
    <h2 class="text-daisyBush text-center text-xl font-bold">
      Are you sure you want to delete this invoice?
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="text-daisyBush text-center text-lg font-medium">
      This will delete the invoice to <span class="text-scarlet">{invoice?.client.name}</span> for
      <span class="text-scarlet">{centsToDollars(sumLineItems(invoice?.lineItems))}?</span>
    </h2>
  {/snippet}

  <div class="flex justify-center gap-4">
    <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
    <Button variant="destructive" onclick={handleDelete}>Yes, Delete It.</Button>
  </div>
</Modal>
