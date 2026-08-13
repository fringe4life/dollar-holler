<script lang="ts">
  import { css } from "styled-system/css";
  import { page } from "$app/state";
  import BlankState from "#features/invoices/components/BlankState.svelte";
  import InvoiceForm from "#features/invoices/components/InvoiceForm.svelte";
  import InvoiceRow from "#features/invoices/components/InvoiceRow.svelte";
  import InvoiceRowHeader from "#features/invoices/components/InvoiceRowHeader.svelte";
  import InvoiceRowSkeleton from "#features/invoices/components/InvoiceRowSkeleton.svelte";
  import {
    deleteInvoice,
    listInvoices,
    updateInvoiceStatus,
  } from "#features/invoices/invoices.remote";
  import type { InvoiceListResponse } from "#features/invoices/types";
  import ItemsHeader from "#features/pagination/components/ItemsHeader.svelte";
  import NoSearchResults from "#features/pagination/components/NoSearchResults.svelte";
  import PaginatedList from "#features/pagination/components/PaginatedList.svelte";
  import { DEFAULT_PAGINATION_METADATA } from "#features/pagination/constants";
  import { normalizeListQueryFromUrl } from "#features/pagination/utils/list-query";
  import { visibleListUrl } from "#features/pagination/utils/url";
  import { ItemPanel } from "#lib/client/runes/ItemPanel.svelte";
  import ConfirmDelete from "#lib/components/ConfirmDelete.svelte";
  import Modal from "#lib/components/Modal.svelte";
  import type { CursorId } from "#lib/types";
  import { getErrorMessage } from "#lib/utils/error-message";
  import { formatTotal } from "#lib/utils/moneyHelpers";
  import { toast } from "#lib/utils/toast.svelte";

  const listArg = $derived(
    normalizeListQueryFromUrl(visibleListUrl(page)).normalized
  );
  const list = $derived(await listInvoices(listArg));

  const createForm = new ItemPanel<undefined>();
  const editPanel = new ItemPanel<CursorId>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();
</script>

<svelte:head><title>Invoices | Dollar Holler</title></svelte:head>

<ItemsHeader open={createForm.open.bind(null, undefined)}>
  {#snippet button()}
    + Invoice
  {/snippet}
</ItemsHeader>

<svelte:boundary>
  {#snippet pending()}
    <PaginatedList
      items={[]}
      paginationMetadata={DEFAULT_PAGINATION_METADATA}
      pending={true}
    >
      {#snippet header()}
        <InvoiceRowHeader />
      {/snippet}
      {#snippet skeleton()}
        <InvoiceRowSkeleton />
      {/snippet}
      {#snippet row(_invoice)}{/snippet}
    </PaginatedList>
  {/snippet}
  {#snippet failed(err, reset)}
    <p class={css({ color: "scarlet", fontSize: "lg" })}>
      Error: {err instanceof Error ? err.message : "Failed to load invoices"}
    </p>
    <button onclick={reset} type="button">Retry</button>
  {/snippet}

  <PaginatedList
    items={list.items}
    paginationMetadata={list.paginationMetadata}
    pending={$effect.pending() > 0}
  >
    {#snippet header()}
      <InvoiceRowHeader />
    {/snippet}
    {#snippet skeleton()}
      <InvoiceRowSkeleton />
    {/snippet}
    {#snippet row(invoice)}
      <InvoiceRow
        {invoice}
        onDelete={deleteModal.open}
        onEdit={(inv) => editPanel.open(inv.id)}
        onSendInvoice={async (inv) => {
          try {
            await updateInvoiceStatus({
              id: inv.id,
              invoiceStatus: "sent",
            }).updates(listInvoices(listArg));
            toast.success("Invoice updated successfully");
          } catch (error) {
            toast.error(
              getErrorMessage(error, "Failed to update invoice status")
            );
          }
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
    if (!deleteModal?.item?.id) {
      return;
    }
    try {
      await deleteInvoice({ id: deleteModal.item.id }).updates(
        listInvoices(listArg)
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
