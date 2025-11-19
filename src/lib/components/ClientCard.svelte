<script lang="ts">
  import type { ClientSelect } from '$lib/validators'
  import { getInvoicesByClientId } from '$lib/stores/invoicesStore.svelte'

  let { client }: { client: ClientSelect } = $props()

  // Create a promise for the client's invoices
  const invoicesPromise = getInvoicesByClientId(client.id)
</script>

<div class="client-card rounded-lg border p-4 shadow-sm">
  <h3 class="text-lg font-semibold">{client.name}</h3>
  <p class="text-gray-600">{client.email}</p>

  {#if client.street || client.city || client.state || client.zip}
    <div class="mt-2 text-sm text-gray-600">
      {client.street}
      {#if client.city}
        <br />{client.city}
        {#if client.state}, {client.state}{/if}
        {#if client.zip}
          {client.zip}{/if}
      {/if}
    </div>
  {/if}

  <!-- Use Svelte's built-in promise handling -->
  <div class="mt-4">
    <h4 class="font-medium">Recent Invoices</h4>

    {#await invoicesPromise}
      <div class="text-sm text-gray-500">Loading invoices...</div>
    {:then invoices}
      {#if invoices.length === 0}
        <div class="text-sm text-gray-500">No invoices found</div>
      {:else}
        <div class="space-y-1">
          {#each invoices.slice(0, 3) as invoice (invoice.id)}
            <div class="border-l-2 border-blue-200 pl-2 text-sm">
              <div class="font-medium">#{invoice.invoiceNumber}</div>
              <div class="text-gray-600">${invoice.total?.toFixed(2) || '0.00'}</div>
            </div>
          {/each}
          {#if invoices.length > 3}
            <div class="text-xs text-gray-500">+{invoices.length - 3} more</div>
          {/if}
        </div>
      {/if}
    {:catch error}
      <div class="text-sm text-red-500">Error loading invoices: {error.message}</div>
    {/await}
  </div>
</div>
