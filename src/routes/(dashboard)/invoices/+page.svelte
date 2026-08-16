<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { page } from "$app/state";
  import BoundaryError from "#lib/components/BoundaryError.svelte";
  import BlankState from "#features/invoices/components/BlankState.svelte";
  import InvoiceForm from "#features/invoices/components/InvoiceForm.svelte";
  import InvoiceRow from "#features/invoices/components/InvoiceRow.svelte";
  import InvoiceRowHeader from "#features/invoices/components/InvoiceRowHeader.svelte";
  import InvoiceRowSkeleton from "#features/invoices/components/InvoiceRowSkeleton.svelte";
  import {
    deleteInvoice,
    listInvoices,
    updateInvoiceStatus,
  } from "#features/invoices/invoices.remote.ts";
  import type { InvoiceListResponse } from "#features/invoices/types.ts";
  import ItemsHeader from "#features/pagination/components/ItemsHeader.svelte";
  import NoSearchResults from "#features/pagination/components/NoSearchResults.svelte";
  import PaginatedList from "#features/pagination/components/PaginatedList.svelte";
  import PaginatedListSkeleton from "#features/pagination/components/PaginatedListSkeleton.svelte";
  import { normalizeListQueryFromUrl } from "#features/pagination/utils/list-query.ts";
  import { omitListItem } from "#features/pagination/utils/omit-list-item.ts";
  import { visibleListUrl } from "#features/pagination/utils/url.ts";
  import { ItemPanel } from "#lib/client/runes/ItemPanel.svelte.ts";
  import ConfirmDelete from "#lib/components/ConfirmDelete.svelte";
  import Modal from "#lib/components/Modal.svelte";
  import type { CursorId } from "#lib/types.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";
  import { formatTotal } from "#lib/utils/moneyHelpers.ts";
  import { toast } from "#lib/utils/toast.svelte.ts";

  const listArg = $derived(
    normalizeListQueryFromUrl(visibleListUrl(page)).normalized
  );
  const list = $derived(await listInvoices(listArg));

  const createForm = new ItemPanel<undefined>();
  const editPanel = new ItemPanel<CursorId>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();

  const handleSendInvoice = async (inv: InvoiceListResponse) => {
    try {
      await updateInvoiceStatus({
        id: inv.id,
        invoiceStatus: "sent",
      }).updates(
        listInvoices(listArg).withOverride((current) => ({
          ...current,
          items: current.items.map((invoice) =>
            invoice.id === inv.id
              ? { ...invoice, invoiceStatus: "sent" as const }
              : invoice
          ),
        }))
      );
      toast.success("Invoice updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update invoice status"));
    }
  };
</script>

<svelte:head>
  <title>Invoices | Dollar Holler</title>
  <meta
    content="Create, send, and track invoices for your clients in Dollar Holler."
    name="description"
  />
</svelte:head>

<ItemsHeader open={createForm.open.bind(null, undefined)}>
  {#snippet button()}
    + Invoice
  {/snippet}
</ItemsHeader>

<svelte:boundary>
  {#snippet pending()}
    <PaginatedListSkeleton>
      {#snippet header()}
        <InvoiceRowHeader />
      {/snippet}
      {#snippet skeleton()}
        <InvoiceRowSkeleton />
      {/snippet}
    </PaginatedListSkeleton>
  {/snippet}
  {#snippet failed(err, reset)}
    <BoundaryError
      error={err}
      fallbackMessage="Failed to load invoices"
      onRetry={reset}
      title="We couldn’t load your invoices"
    />
  {/snippet}

  <PaginatedList
    items={list.items}
    paginationMetadata={list.paginationMetadata}
  >
    {#snippet header()}
      <InvoiceRowHeader />
    {/snippet}
    {#snippet row(invoice)}
      <InvoiceRow
        {invoice}
        onDelete={deleteModal.open}
        onEdit={(inv) => editPanel.open(inv.id)}
        onSendInvoice={handleSendInvoice}
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
</svelte:boundary>

<Modal onClose={createForm.close} variant="panel" {@attach createForm.attach}>
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

<Modal onClose={editPanel.close} variant="panel" {@attach editPanel.attach}>
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
    const item = deleteModal.item;
    if (!item?.id) {
      return;
    }
    try {
      await deleteInvoice({ id: item.id }).updates(
        listInvoices(listArg).withOverride((current) =>
          omitListItem(current, item.id)
        )
      );
      toast.success("Invoice deleted successfully");
      deleteModal.close();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete invoice"));
    }
  }}
  titleText="Are you sure you want to delete this invoice?"
  {@attach deleteModal.attach}
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
