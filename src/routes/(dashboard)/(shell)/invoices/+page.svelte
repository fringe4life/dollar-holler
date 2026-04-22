<script lang="ts">
  /**
   * List UI: SSR uses `data` from +page.server.ts (effects do not run on the server).
   * After hydration, `invoicesStore` matches `listUrlKey(page.url)` and owns the rows.
   */
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import BlankState from "$features/invoices/components/BlankState.svelte";
  import InvoiceForm from "$features/invoices/components/InvoiceForm.svelte";
  import InvoiceRow from "$features/invoices/components/InvoiceRow.svelte";
  import InvoiceRowHeader from "$features/invoices/components/InvoiceRowHeader.svelte";
  import InvoiceRowSkeleton from "$features/invoices/components/InvoiceRowSkeleton.svelte";
  import type {
    InvoiceListResponse,
    InvoiceSelect,
  } from "$features/invoices/types";
  import PaginatedList from "$features/pagination/components/PaginatedList.svelte";
  import type { CursorPaginatedList } from "$features/pagination/types";
  import { listUrlKey } from "$features/pagination/utils/url";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import ItemsHeader from "$lib/components/ItemsHeader.svelte";
  import NoSearchResults from "$lib/components/NoSearchResults.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
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

  const createForm = new Toggle();
  const editPanel = new ItemPanel<InvoiceSelect>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();
</script>

<svelte:head>
  <title>Invoices | Dollar Holler</title>
</svelte:head>

<ItemsHeader store={invoicesStore} toggle={createForm.toggle}>
  {#snippet button()}
    + Invoice
  {/snippet}
</ItemsHeader>

<PaginatedList store={invoicesStore}>
  {#snippet header()}
    <InvoiceRowHeader />
  {/snippet}
  {#snippet skeleton()}
    <InvoiceRowSkeleton />
  {/snippet}
  {#snippet row(invoice)}
    <InvoiceRow {invoice} onEdit={editPanel.open} onDelete={deleteModal.open} />
  {/snippet}
  {#snippet blankState()}
    <BlankState />
  {/snippet}
  {#snippet noResults()}
    <NoSearchResults>
      {#snippet header()}
        <InvoiceRowHeader emptyState={true} />
      {/snippet}
    </NoSearchResults>
  {/snippet}
</PaginatedList>

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

  <InvoiceForm mode="create" closePanel={createForm.off} />
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
        >{invoice.name}</span
      >
      for
      <span class="text-scarlet">{formatTotal(invoice.total)}</span>
    {/snippet}
  </ConfirmDelete>
{/if}
