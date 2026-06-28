<script lang="ts">
  import { css } from "styled-system/css";
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
  import type { InvoiceListResponse } from "$features/invoices/types";
  import ItemsHeader from "$features/pagination/components/ItemsHeader.svelte";
  import NoSearchResults from "$features/pagination/components/NoSearchResults.svelte";
  import PaginatedList from "$features/pagination/components/PaginatedList.svelte";
  import type { CursorPaginatedList } from "$features/pagination/types";
  import { listUrlKey } from "$features/pagination/utils/url";
  import { ItemPanel } from "$lib/client/runes/ItemPanel.svelte";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { CursorId } from "$lib/types";
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

  const createForm = new ItemPanel<undefined>();
  const editPanel = new ItemPanel<CursorId>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();
</script>

<svelte:head> <title>Invoices | Dollar Holler</title> </svelte:head>

<ItemsHeader open={createForm.open.bind(null, undefined)} store={invoicesStore}>
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
  {#snippet row(_invoice)}
    <InvoiceRow
      invoice={_invoice}
      onDelete={deleteModal.open}
      onEdit={(inv) => editPanel.open(inv.id)}
      onSendInvoice={async (inv) => {
        await invoicesStore.updateInvoiceStatus(inv.id, "sent");
      }}
    />
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

<Modal
  onClose={createForm.close}
  variant="panel"
  bind:dialogEl={createForm.dialogEl}
>
  {#snippet title()}
    <h2
      class={css({
        fontFamily: "sansserif",
        color: "daisyBush",
        marginBlockStart: { base: 9, lg: 0 },
        marginBlockEnd: 7,
        fontSize: "3xl",
        fontWeight: "bold",
      })}
    >
      Add an Invoice
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class={css({ display: "none" })}>""</h2>
  {/snippet}

  <InvoiceForm closePanel={createForm.close} mode="create" />
</Modal>

<Modal
  onClose={editPanel.close}
  variant="panel"
  bind:dialogEl={editPanel.dialogEl}
>
  {#snippet title()}
    <h2
      class={css({
      fontFamily: "sansserif",
      color: "daisyBush",
      marginBlockEnd: 7,
      fontSize: "3xl",
      fontWeight: "bold",
    })}
    >
      Edit an Invoice
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class={css({ display: "none" })}>Add an invoice</h2>
  {/snippet}

  {#if editPanel.item}
    {#key editPanel.item}
      <InvoiceForm
        closePanel={editPanel.close}
        invoiceId={editPanel.item}
        mode="edit"
      />
    {/key}
  {/if}
</Modal>

<ConfirmDelete
  item={deleteModal.item}
  onCancel={deleteModal.close}
  onDelete={async () => {
      if (!deleteModal?.item?.id) {
        return;
      }
      await invoicesStore.deleteInvoice(deleteModal.item.id);
      deleteModal.close();
    }}
  titleText="Are you sure you want to delete this invoice?"
  bind:dialogEl={deleteModal.dialogEl}
>
  {#snippet descriptionSnippet(_invoice)}
    This will delete the invoice to
    <span class={css({ color: "scarlet" })}>{_invoice?.name ?? "Unknown"}</span>
    for
    <span class={css({ color: "scarlet" })}
      >{formatTotal(_invoice?.total ?? 0)}</span
    >
  {/snippet}
</ConfirmDelete>
