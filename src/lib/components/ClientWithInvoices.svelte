<script lang="ts">
  import type { ClientSelect, InvoiceSelect } from '$lib/validators'
  import { getInvoicesByClientId } from '$lib/stores/invoicesStore.svelte'

  let { client }: { client: ClientSelect } = $props()

  // Reactive promises for related data
  let invoicesPromise = $state<Promise<InvoiceSelect[]>>()
  let invoices = $state<InvoiceSelect[]>([])
  let invoicesLoading = $state(false)
  let invoicesError = $state<string | null>(null)

  // Load invoices when client changes
  $effect(() => {
    if (client?.id) {
      invoicesLoading = true
      invoicesError = null
      invoicesPromise = getInvoicesByClientId(client.id)

      invoicesPromise
        .then(result => {
          invoices = result
          invoicesLoading = false
        })
        .catch(error => {
          invoicesError = error.message
          invoicesLoading = false
        })
    }
  })

  // Calculate derived values
  const totalInvoices = $derived(invoices.length)
  const totalAmount = $derived(invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0))
</script>

<div class="client-card rounded-lg border p-4">
  <h3 class="text-lg font-semibold">{client.name}</h3>
  <p class="text-gray-600">{client.email}</p>

  <!-- Invoices section with suspense-like loading -->
  <div class="mt-4">
    <h4 class="font-medium">Invoices ({totalInvoices})</h4>

    {#if invoicesLoading}
      <div class="text-sm text-gray-500">Loading invoices...</div>
    {:else if invoicesError}
      <div class="text-sm text-red-500">Error: {invoicesError}</div>
    {:else if invoices.length === 0}
      <div class="text-sm text-gray-500">No invoices found</div>
    {:else}
      <div class="space-y-2">
        {#each invoices as invoice (invoice.id)}
          <div class="border-l-2 border-blue-200 pl-2 text-sm">
            <div class="font-medium">Invoice #{invoice.invoiceNumber}</div>
            <div class="text-gray-600">${invoice.total?.toFixed(2) || '0.00'}</div>
            <div class="text-xs text-gray-500">{invoice.invoiceStatus || 'Draft'}</div>
          </div>
        {/each}
      </div>
    {/if}

    <div class="mt-2 text-sm font-medium">
      Total: ${totalAmount.toFixed(2)}
    </div>
  </div>
</div>
