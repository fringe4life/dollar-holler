<script lang="ts">
  import { ClientsStore } from "$lib/features/clients/stores/clientsStore.svelte";
  import { InvoicesStore } from "$lib/features/invoices/stores/invoicesStore.svelte";
  import { LineItemsStore } from "$lib/features/line-items/stores/lineItemsStore.svelte";
  import { SettingsStore } from "$lib/features/settings/stores/settingsStore.svelte";
  import { setDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import { onDestroy } from "svelte";

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
