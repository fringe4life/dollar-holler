<script lang="ts">
  import ModalE from '$lib/components/ModalE.svelte'
  import { Button } from '$lib/components/ui/button'
  import { deleteInvoice } from '$lib/stores/InvoiceStore.svelte'
  import { centsToDollars, sumLineItems } from '$lib/utils/moneyHelpers'
  import type { MouseEventHandler } from 'svelte/elements'

  import type { Invoice } from '$lib/db/schema'

  type Props = {
    open: boolean
    invoice: Invoice
  }

  const handleDelete: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = async () => {
    open = false
    await deleteInvoice(invoice)
  }

  let { invoice, open = $bindable() }: Props = $props()
</script>

<ModalE bind:open buttonText="" className="z-450">
  {#snippet title()}
    <h2 class="text-daisyBush text-center text-xl font-bold">
      Are you sure you want to delete this invoice?
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="text-daisyBush text-center text-lg font-medium">
      This will delete the invoice to <span class="text-scarlet">{invoice.client.name}</span> for
      <span class="text-scarlet">{centsToDollars(sumLineItems(invoice.lineItems))}?</span>
    </h2>
  {/snippet}

  <div class="flex justify-center gap-4">
    <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
    <Button variant="destructive" onclick={handleDelete}>Yes, Delete It.</Button>
  </div>
</ModalE>
