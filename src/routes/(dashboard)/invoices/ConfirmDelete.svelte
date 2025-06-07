<script lang="ts">
  import ModalE from '$lib/components/ModalE.svelte'
  import { Button } from '$lib/components/ui/button'
  import { deleteInvoice } from '$lib/stores/InvoiceStore'
  import { centsToDollars, sumLineItems } from '$lib/utils/moneyHelpers'
  import { toast } from 'svelte-sonner'
  import type { Invoice } from '../../../global'

  type Props = {
    open: boolean
    invoice: Invoice
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

  {#snippet children()}
    <div class="flex justify-center gap-4">
      <Button variant="secondary" onclick={() => (open = false)}>Cancel</Button>
      <Button
        variant="destructive"
        onclick={() => {
          open = false
          deleteInvoice(invoice)
          toast.success('Invoice successfully deleted')
        }}>Yes, Delete It.</Button
      >
    </div>
  {/snippet}
</ModalE>
