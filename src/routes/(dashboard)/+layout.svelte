<script lang="ts">
  import Navbar from "$lib/components/Navbar.svelte";
  import { ClientsStore } from "$lib/stores/clientsStore.svelte";
  import { setDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import { InvoicesStore } from "$lib/stores/invoicesStore.svelte";
  import { LineItemsStore } from "$lib/stores/lineItemsStore.svelte";
  import { SettingsStore } from "$lib/stores/settingsStore.svelte";
  import { onDestroy } from "svelte";

  let { children, data } = $props();

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

<div class="grid grid-cols-12 bg-whisper min-block-dvh md:gap-x-16">
  <Navbar user={data.user} />
  <main class="col-span-12 px-4 pbs-4 md:col-span-8 md:pbs-10">
    {@render children()}
  </main>
</div>
