<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { page } from "$app/state";
  import { toast } from "svelte-sonner";
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
  import { buttonIcon } from "#lib/styles.ts";
  import {
    ItemPanel,
    upsertKey,
    type UpsertTarget,
  } from "#lib/client/runes/ItemPanel.svelte.ts";
  import ConfirmDelete from "#lib/components/ConfirmDelete.svelte";
  import FormPanel from "#lib/components/form/FormPanel.svelte";
  import type { CursorId } from "#lib/types.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";
  import { formatTotal } from "#lib/utils/moneyHelpers.ts";

  const listArg = $derived(
    normalizeListQueryFromUrl(visibleListUrl(page)).normalized
  );
  const list = $derived(await listInvoices(listArg));

  const formPanel = new ItemPanel<UpsertTarget<CursorId>>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();
  const formTarget = $derived(formPanel.item);
  const isEdit = $derived(formTarget?.kind === "edit");

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

<ItemsHeader open={() => formPanel.open({ kind: "create" })}>
  {#snippet button()}
    <span aria-hidden="true" class={buttonIcon("plus")}>+</span>
    Invoice
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
      title="We couldn't load your invoices"
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
        onEdit={(inv) => formPanel.open({ kind: "edit", item: inv.id })}
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

<FormPanel
  attach={formPanel.attach}
  descriptionText={isEdit ? "Edit an invoice" : "Create a new invoice"}
  onClose={formPanel.close}
  titleText={isEdit ? "Edit an Invoice" : "Add an Invoice"}
>
  {#if formTarget}
    {#key upsertKey(formTarget, (invoiceId) => String(invoiceId))}
      {#if formTarget.kind === "edit"}
        <InvoiceForm
          closePanel={formPanel.close}
          invoiceId={formTarget.item}
          mode="edit"
        />
      {:else}
        <InvoiceForm closePanel={formPanel.close} mode="create" />
      {/if}
    {/key}
  {/if}
</FormPanel>

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
  {#snippet descriptionSnippet(invoice)}
    This will delete the invoice to
    <span class={css({ color: "scarlet" })}>{invoice?.name ?? "Unknown"}</span>
    for
    <span class={css({ color: "scarlet" })}
      >{formatTotal(invoice?.total ?? 0)}</span
    >
  {/snippet}
</ConfirmDelete>
