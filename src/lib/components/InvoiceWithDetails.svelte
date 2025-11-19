<script lang="ts">
  import type { InvoiceSelect, LineItemSelect, ClientSelect } from '$lib/validators'
  import { getClientById } from '$lib/stores/clientsStore.svelte'
  import { loadLineItemsByInvoiceId } from '$lib/stores/lineItemsStore.svelte'

  let { invoice }: { invoice: InvoiceSelect } = $props()

  // Reactive promises for related data
  let clientPromise = $state<Promise<ClientSelect | null>>()
  let lineItemsPromise = $state<Promise<LineItemSelect[]>>()

  let client = $state<ClientSelect | null>(null)
  let lineItems = $state<LineItemSelect[]>([])
  let clientLoading = $state(false)
  let lineItemsLoading = $state(false)
  let clientError = $state<string | null>(null)
  let lineItemsError = $state<string | null>(null)

  // Load related data when invoice changes
  $effect(() => {
    if (invoice?.clientId) {
      // Load client
      clientLoading = true
      clientError = null
      clientPromise = getClientById(invoice.clientId)

      clientPromise
        ?.then(result => {
          client = result
          clientLoading = false
        })
        .catch(error => {
          clientError = error.message
          clientLoading = false
        })
    }

    if (invoice?.id) {
      // Load line items
      lineItemsLoading = true
      lineItemsError = null
      lineItemsPromise = loadLineItemsByInvoiceId(invoice.id)

      lineItemsPromise
        ?.then(result => {
          lineItems = result
          lineItemsLoading = false
        })
        .catch(error => {
          lineItemsError = error.message
          lineItemsLoading = false
        })
    }
  })

  // Calculate derived values
  const totalLineItems = $derived(lineItems.length)
  const subtotal = $derived(lineItems.reduce((sum, item) => sum + (item.amount || 0), 0))
</script>

<div class="invoice-card rounded-lg border p-4">
  <div class="flex items-start justify-between">
    <div>
      <h3 class="text-lg font-semibold">Invoice #{invoice.invoiceNumber}</h3>
      <div class="text-sm text-gray-600">
        {#if clientLoading}
          Loading client...
        {:else if clientError}
          Error loading client
        {:else if client}
          {client.name}
        {:else}
          Unknown client
        {/if}
      </div>
    </div>
    <div class="text-right">
      <div class="text-lg font-bold">${invoice.amount?.toFixed(2) || '0.00'}</div>
      <div class="text-sm text-gray-500">{invoice.invoiceStatus || 'Draft'}</div>
    </div>
  </div>

  <!-- Line items section -->
  <div class="mt-4">
    <h4 class="font-medium">Line Items ({totalLineItems})</h4>

    {#if lineItemsLoading}
      <div class="text-sm text-gray-500">Loading line items...</div>
    {:else if lineItemsError}
      <div class="text-sm text-red-500">Error: {lineItemsError}</div>
    {:else if lineItems.length === 0}
      <div class="text-sm text-gray-500">No line items found</div>
    {:else}
      <div class="space-y-2">
        {#each lineItems as item (item.id)}
          <div class="border-l-2 border-green-200 pl-2 text-sm">
            <div class="font-medium">{item.description}</div>
            <div class="text-gray-600">
              {item.quantity || 0} × ${(item.amount / (item.quantity || 1)).toFixed(2)} = ${item.amount?.toFixed(
                2
              ) || '0.00'}
            </div>
          </div>
        {/each}
      </div>

      <div class="mt-2 text-sm font-medium">
        Subtotal: ${subtotal.toFixed(2)}
      </div>
    {/if}
  </div>
</div>
