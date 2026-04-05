<script lang="ts">
  import { ClientsStore } from "$lib/stores/clientsStore.svelte";
  import { setDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import { InvoicesStore } from "$lib/stores/invoicesStore.svelte";
  import { LineItemsStore } from "$lib/stores/lineItemsStore.svelte";
  import { SettingsStore } from "$lib/stores/settingsStore.svelte";
  import { onDestroy } from "svelte";

  let { children } = $props();

  const clients = new ClientsStore();
  const invoices = new InvoicesStore();
  const lineItems = new LineItemsStore();
  const settings = new SettingsStore();

  setDashboardStores({ clients, invoices, lineItems, settings });

  onDestroy(() => {
    clients.resetClients();
    invoices.resetInvoices();
    lineItems.resetLineItems();
    settings.reset();
  });
</script>

{@render children()}
