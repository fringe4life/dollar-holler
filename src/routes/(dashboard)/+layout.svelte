<script lang="ts">
  import { onDestroy } from "svelte";
  import { ClientsStore } from "$features/clients/stores/clientsStore.svelte";
  import { InvoicesStore } from "$features/invoices/stores/invoicesStore.svelte";
  import { LineItemsStore } from "$features/line-items/stores/lineItemsStore.svelte";
  import { SettingsStore } from "$features/settings/stores/settingsStore.svelte";
  import { setDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";

  let { children } = $props();

  const clients = new ClientsStore();
  const invoices = new InvoicesStore();
  const lineItems = new LineItemsStore();
  const settings = new SettingsStore();

  setDashboardStores({ clients, invoices, lineItems, settings });

  onDestroy(() => {
    clients.resetList();
    invoices.resetList();
    lineItems.resetLineItems();
    settings.reset();
  });
</script>

{@render children()}
