<script lang="ts">
  /**
   * List UI: SSR uses `data` from +page.server.ts (effects do not run on the server).
   * After hydration, `invoicesStore` matches `listUrlKey(page.url)` and owns the rows.
   */
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import NoSearchResults from "$lib/components/NoSearchResults.svelte";
  import Search from "$lib/components/Search.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import BlankState from "$lib/features/invoices/components/BlankState.svelte";
  import InvoiceForm from "$lib/features/invoices/components/InvoiceForm.svelte";
  import InvoiceRow from "$lib/features/invoices/components/InvoiceRow.svelte";
  import InvoiceRowHeader from "$lib/features/invoices/components/InvoiceRowHeader.svelte";
  import InvoiceRowSkeleton from "$lib/features/invoices/components/InvoiceRowSkeleton.svelte";
  import type {
    InvoiceListResponse,
    InvoiceSelect,
  } from "$lib/features/invoices/types";
  import Pagination from "$lib/features/pagination/components/Pagination.svelte";
  import type { CursorPaginatedList } from "$lib/features/pagination/types";
  import { listUrlKey } from "$lib/features/pagination/utils/url";
  import { ItemPanel } from "$lib/runes/ItemPanel.svelte";
  import { Toggle } from "$lib/runes/Toggle.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import { formatTotal } from "$lib/utils/moneyHelpers";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();
  const { invoices: invoicesStore } = getDashboardStores();
  // this is to prevent the loading state from being false when the page is loaded
  invoicesStore.loading = true;
  const currentData = $derived({
    items: data.items,
    paginationMetadata: data.paginationMetadata,
  } satisfies CursorPaginatedList<InvoiceListResponse>);
  /** Re-sync store when `page.url` / `data` change after navigation (e.g. browser back). */
  afterNavigate(() => {
    invoicesStore.hydrateFromLoad(currentData, listUrlKey(page.url));
  });

  const searchQuery = $derived(page.url.searchParams.get("q") ?? "");

  const createForm = new Toggle();
  const editPanel = new ItemPanel<InvoiceSelect>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();
</script>

<svelte:head>
  <title>Invoices | Dollar Holler</title>
</svelte:head>

<div
  class="mbe-7 flex flex-col-reverse items-start justify-between gap-y-6 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mbe-16 lg:py-3 lg:text-lg"
>
  <Search store={invoicesStore} />
  <div class="z-1">
    <Button onclick={createForm.toggle} size="lg">+ Invoice</Button>
  </div>
</div>

<div class="flex grow flex-col">
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
  {:else if invoicesStore.items.length === 0 && !searchQuery && !invoicesStore.loading}
    <BlankState />
  {:else if invoicesStore.items.length === 0 && searchQuery && !invoicesStore.loading}
    <NoSearchResults>
      {#snippet header()}
        <InvoiceRowHeader emptyState={true} />
      {/snippet}
    </NoSearchResults>
  {:else}
    <div
      class="grid min-h-full items-start gap-y-4 lg:grid-rows-[min-content_1fr_min-content]"
    >
      <InvoiceRowHeader />
      <div class="flex h-full flex-col-reverse justify-end gap-4">
        {#each invoicesStore.items as invoice (invoice.id)}
          <InvoiceRow
            {invoice}
            onEdit={editPanel.open}
            onDelete={deleteModal.open}
          />
        {/each}
      </div>
      <Pagination store={invoicesStore} />
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
