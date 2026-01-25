<script lang="ts">
  import { resolve } from "$app/paths";
  import { clientsStore } from "$lib/stores/clientsStore.svelte";
  import { lineItemsStore } from "$lib/stores/lineItemsStore.svelte";
  import type { InvoiceSelect, LineItemSelect } from "$lib/validators";

  let { invoice }: { invoice: InvoiceSelect } = $props();

  // Use $derived for reactive promises - re-fetches when invoice changes
  const clientPromise = $derived(clientsStore.getClientById(invoice.clientId));

  const lineItemsPromise = $derived(
    lineItemsStore.loadLineItemsByInvoiceId(invoice.id)
  );

  // Helper to calculate subtotal from line items array
  const calcSubtotal = (items: LineItemSelect[]) =>
    items.reduce((sum, item) => sum + (item.amount || 0), 0);
</script>

<div class="invoice-card rounded-lg border p-4">
  <div class="flex items-start justify-between">
    <div>
      <h3 class="text-lg font-semibold">
        <a
          class="hover:text-daisyBush hover:underline"
          href={resolve(`/invoices/${invoice.id}`)}
          >Invoice #{invoice.invoiceNumber}</a
        >
      </h3>
      <div class="text-sm text-gray-600">
        {#await clientPromise}
          Loading client...
        {:then client}
          {client?.name || "Unknown client"}
        {:catch}
          Error loading client
        {/await}
      </div>
    </div>
    <div class="text-right">
      <div class="text-lg font-bold">{invoice.subject || "No subject"}</div>
      <div class="text-sm text-gray-500">
        {invoice.invoiceStatus || "Draft"}
      </div>
    </div>
  </div>

  <!-- Line items section using {#await} for loading states -->
  <div class="mt-4">
    {#await lineItemsPromise}
      <h4 class="font-medium">Line Items (...)</h4>
      <div
        class="text-sm text-gray-500 h-[40px] w-full rounded bg-gray-200 animate-pulse"
      ></div>
    {:then lineItems}
      <h4 class="font-medium">Line Items ({lineItems.length})</h4>

      {#if lineItems.length === 0}
        <div
          class="text-sm text-gray-500 h-[40px] w-full grid place-items-center"
        >
          No line items found
        </div>
      {:else}
        <div class="grid sm:grid-flow-col auto-cols-max gap-2 auto-rows-[40px]">
          {#each lineItems as item (item.id)}
            <div class="border-l-2 border-green-200 pl-2 text-sm">
              <div class="font-medium">{item.description}</div>
              <div class="text-gray-600">
                {item.quantity || 0} × ${(
                  item.amount / (item.quantity || 1)
                ).toFixed(2)} = ${item.amount?.toFixed(2) || "0.00"}
              </div>
            </div>
          {/each}
        </div>

        <div class="mt-2 text-sm font-medium">
          Subtotal: ${calcSubtotal(lineItems).toFixed(2)}
        </div>
      {/if}
    {:catch error}
      <h4 class="font-medium">Line Items</h4>
      <div class="text-sm text-red-500">Error: {error.message}</div>
    {/await}
  </div>
</div>
