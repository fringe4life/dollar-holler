<script lang="ts">
  import { page } from "$app/state";
  import { ItemPanel } from "$lib/runes/ItemPanel.svelte";
  import { Toggle } from "$lib/runes/Toggle.svelte";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import InvoiceForm from "$lib/components/InvoiceForm.svelte";
  import NoSearchResults from "$lib/components/NoSearchResults.svelte";
  import Search from "$lib/components/Search.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import { formatTotal } from "$lib/utils/moneyHelpers";
  import type { InvoiceListResponse, InvoiceSelect } from "$lib/validators";
  import { onMount } from "svelte";
  import BlankState from "./BlankState.svelte";
  import InvoiceRow from "./InvoiceRow.svelte";
  import InvoiceRowHeader from "./InvoiceRowHeader.svelte";
  import InvoiceRowSkeleton from "./InvoiceRowSkeleton.svelte";

  let { data } = $props();
  const searchQuery = $derived(page.url.searchParams.get("q") ?? "");
  // Class based state to manage modals/dialogs
  const createForm = new Toggle();
  const editPanel = new ItemPanel<InvoiceSelect>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();

  const { invoices: invoicesStore } = getDashboardStores();

  onMount(async () => {
    const ac = new AbortController();
    await invoicesStore.loadItems(searchQuery, { signal: ac.signal });
    return () => ac.abort();
  });
</script>

<svelte:head>
  <title>Invoices | Dollar Holler</title>
</svelte:head>

<div
  class="mbe-7 flex flex-col-reverse items-start justify-between gap-y-6 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mbe-16 lg:py-3 lg:text-lg"
>
  <Search store={invoicesStore} />
  <!-- new invoice button -->
  <div class="z-1">
    <Button onclick={createForm.toggle} size="lg">+ Invoice</Button>
  </div>
</div>

<!-- list of invoices -->
<div>
  {#if invoicesStore.loading}
    <InvoiceRowHeader />
    <div class="flex flex-col-reverse gap-4">
      <InvoiceRowSkeleton />
      <InvoiceRowSkeleton />
      <InvoiceRowSkeleton />
      <InvoiceRowSkeleton />
      <InvoiceRowSkeleton />
    </div>
  {:else if invoicesStore.error}
    <div class="grid place-content-center py-8 block-full">
      <div class="text-lg text-red-500">Error: {invoicesStore.error}</div>
    </div>
  {:else if invoicesStore.invoices.length === 0 && !searchQuery}
    <BlankState />
  {:else if invoicesStore.invoices.length === 0 && searchQuery}
    <NoSearchResults>
      {#snippet header()}
        <InvoiceRowHeader emptyState={true} />
      {/snippet}
    </NoSearchResults>
  {:else}
    <InvoiceRowHeader />
    <div class="flex flex-col-reverse gap-4">
      {#each invoicesStore.invoices as invoice (invoice.id)}
        <InvoiceRow
          {invoice}
          onEdit={editPanel.open}
          onDelete={deleteModal.open}
        />
      {/each}
    </div>
  {/if}
</div>

<SlidePanel bind:open={createForm.isOn} buttonText="">
  {#snippet title()}
    <h2
      class="font-sansserif text-daisyBush mbs-9 mbe-7 text-3xl font-bold lg:mbs-0"
    >
      Add an Invoice
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  <InvoiceForm
    mode="create"
    userId={data.user?.id ?? ""}
    closePanel={createForm.off}
  />
</SlidePanel>

<SlidePanel bind:open={editPanel.toggle.isOn} buttonText="">
  {#snippet title()}
    <h2 class="font-sansserif text-daisyBush mbe-7 text-3xl font-bold">
      Edit an Invoice
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  {#if editPanel.item}
    {#key editPanel.item.id}
      <InvoiceForm
        mode="edit"
        bind:invoiceEdit={editPanel.item}
        userId={data.user?.id ?? ""}
        closePanel={editPanel.close}
      />
    {/key}
  {/if}
</SlidePanel>

{#if deleteModal.item}
  <ConfirmDelete
    item={deleteModal.item}
    bind:open={deleteModal.toggle.isOn}
    titleText="Are you sure you want to delete this invoice?"
    onCancel={deleteModal.close}
    onDelete={async () => {
      if (!deleteModal?.item?.id) return;
      await invoicesStore.deleteInvoice(deleteModal.item.id);
      deleteModal.close();
    }}
  >
    {#snippet descriptionSnippet(invoice)}
      This will delete the invoice to <span class="text-scarlet"
        >{invoice.client.name}</span
      >
      for
      <span class="text-scarlet">{formatTotal(invoice.total)}</span>
    {/snippet}
  </ConfirmDelete>
{/if}
