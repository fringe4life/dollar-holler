<script lang="ts">
  import { getInvoicesByClientId } from "$lib/stores/invoicesStore.svelte";
  import type { ClientSelect } from "$lib/validators";

  let { client }: { client: ClientSelect } = $props();

  // Use $derived for reactive promise - re-fetches when client.id changes
  const invoicesPromise = $derived(getInvoicesByClientId(client.id));

  // Note: Invoice totals would need to be calculated from line items
  // For now, we just display the invoice count
</script>

<div class="client-card rounded-lg border p-4">
  <h3 class="text-lg font-semibold">{client.name}</h3>
  <p class="text-gray-600">{client.email}</p>

  <!-- Invoices section using {#await} for loading states -->
  <div class="mt-4">
    {#await invoicesPromise}
      <h4 class="font-medium">Invoices (...)</h4>
      <div class="text-sm text-gray-500">Loading invoices...</div>
    {:then invoices}
      <h4 class="font-medium">Invoices ({invoices.length})</h4>

      {#if invoices.length === 0}
        <div class="text-sm text-gray-500">No invoices found</div>
      {:else}
        <div class="space-y-2">
          {#each invoices as invoice (invoice.id)}
            <div class="border-l-2 border-blue-200 pl-2 text-sm">
              <div class="font-medium">Invoice #{invoice.invoiceNumber}</div>
              <div class="text-gray-600">{invoice.subject || "No subject"}</div>
              <div class="text-xs text-gray-500">
                {invoice.invoiceStatus || "Draft"}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {:catch error}
      <h4 class="font-medium">Invoices</h4>
      <div class="text-sm text-red-500">Error: {error.message}</div>
    {/await}
  </div>
</div>
