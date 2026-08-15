<script lang="ts">
  import { css } from "styled-system/css";
  import { between, grid } from "styled-system/patterns";
  import { page } from "$app/state";
  import BlankState from "#features/clients/components/BlankState.svelte";
  import ClientForm, {
    type ClientFormProps,
  } from "#features/clients/components/ClientForm.svelte";
  import {
    clientInvoiceSummary,
    getClient,
    listClientInvoices,
  } from "#features/clients/clients.remote";
  import InvoiceForm from "#features/invoices/components/InvoiceForm.svelte";
  import InvoiceRow from "#features/invoices/components/InvoiceRow.svelte";
  import InvoiceRowHeader from "#features/invoices/components/InvoiceRowHeader.svelte";
  import InvoiceRowSkeleton from "#features/invoices/components/InvoiceRowSkeleton.svelte";
  import InvoiceSummaryItem from "#features/invoices/components/InvoiceSummaryItem.svelte";
  import {
    deleteInvoice,
    updateInvoiceStatus,
  } from "#features/invoices/invoices.remote";
  import type { InvoiceListResponse } from "#features/invoices/types";
  import {
    applyDeletedInvoiceToSummary,
    applySentInvoiceToSummary,
  } from "#features/invoices/utils/client-invoice-summary";
  import ItemsHeader from "#features/pagination/components/ItemsHeader.svelte";
  import NoSearchResults from "#features/pagination/components/NoSearchResults.svelte";
  import PaginatedList from "#features/pagination/components/PaginatedList.svelte";
  import { normalizeListQueryFromUrl } from "#features/pagination/utils/list-query";
  import { omitListItem } from "#features/pagination/utils/omit-list-item";
  import { visibleListUrl } from "#features/pagination/utils/url";
  import { ItemPanel } from "#lib/client/runes/ItemPanel.svelte";
  import CircledAmount from "#lib/components/CircledAmount.svelte";
  import ConfirmDelete from "#lib/components/ConfirmDelete.svelte";
  import Edit from "#lib/components/icons/Edit.svelte";
  import Modal from "#lib/components/Modal.svelte";
  import Button from "#lib/components/ui/button/button.svelte";
  import type { BitsButton, CursorId } from "#lib/types";
  import { getErrorMessage } from "#lib/utils/error-message";
  import { centsToDollars, formatTotal } from "#lib/utils/moneyHelpers";
  import { toast } from "#lib/utils/toast.svelte";

  const listUrl = $derived(visibleListUrl(page));
  const listArg = $derived(normalizeListQueryFromUrl(listUrl).normalized);
  const clientId = $derived(page.params.id as CursorId);
  const client = $derived(await getClient(clientId));
  const invoices = $derived(
    await listClientInvoices({ clientId, listQuery: listArg })
  );
  const summaryArg = $derived(
    listArg.q === undefined ? { clientId } : { clientId, q: listArg.q }
  );
  const summary = $derived(await clientInvoiceSummary(summaryArg));

  const invoiceSummaryTotals = $derived({
    draft: centsToDollars(summary.draft),
    grandTotal: centsToDollars(summary.grandTotal),
    outstanding: centsToDollars(summary.outstanding),
    overdue: centsToDollars(summary.overdue),
    paid: centsToDollars(summary.paid),
  });

  const formPanel = new ItemPanel<undefined>();
  const editPanel = new ItemPanel<CursorId>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();
  let isEditing = $state<ClientFormProps["formState"]>("create");

  const handleEdit: BitsButton = () => {
    isEditing = "edit";
    formPanel.open(undefined);
  };

  const handleSendInvoice = async (inv: InvoiceListResponse) => {
    try {
      await updateInvoiceStatus({
        id: inv.id,
        invoiceStatus: "sent",
      }).updates(
        listClientInvoices({ clientId, listQuery: listArg }).withOverride(
          (current) => ({
            ...current,
            items: current.items.map((invoice) =>
              invoice.id === inv.id
                ? { ...invoice, invoiceStatus: "sent" as const }
                : invoice
            ),
          })
        ),
        clientInvoiceSummary(summaryArg).withOverride((current) =>
          applySentInvoiceToSummary(current, inv)
        )
      );
      toast.success("Invoice updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update invoice status"));
    }
  };
</script>

<svelte:head><title>{client.name} | Doller Holla</title></svelte:head>
<ItemsHeader open={formPanel.open.bind(null, undefined)}>
  {#snippet button()}
    + Client
  {/snippet}
</ItemsHeader>

<svelte:boundary>
  {#snippet pending()}
    <InvoiceRowSkeleton />
  {/snippet}
  {#snippet failed(err, reset)}
    <p class={css({ color: "scarlet", fontSize: "lg" })}>
      Error: {err instanceof Error ? err.message : "Failed to load client"}
    </p>
    <button onclick={reset} type="button">Retry</button>
  {/snippet}

  <div class={between({ marginBlockEnd: 7, inlineSize: "full" })}>
    <h1
      class={css({ color: "daisyBush", fontSize: "3xl", fontWeight: "bold" })}
    >
      {client.name}
    </h1>
    <Button onclick={handleEdit} variant="textOnly"><Edit /> Edit</Button>
  </div>

  <div
    class={grid({
      columns: { base: 1, sm: 2, lg: 4 },
      gap: 4,
      marginBlockEnd: 10,
      backgroundColor: "gallery",
      borderRadius: "lg",
      paddingInline: { base: 6, md: 8, lg: 10 },
      paddingBlock: { base: 4, md: 6, lg: 8 },
    })}
  >
    <InvoiceSummaryItem
      amount={invoiceSummaryTotals.overdue}
      title="Total Overdue"
    />

    <InvoiceSummaryItem
      amount={invoiceSummaryTotals.outstanding}
      title="Total Outstanding"
    />
    <InvoiceSummaryItem
      amount={invoiceSummaryTotals.draft}
      title="Total Draft"
    />
    <InvoiceSummaryItem amount={invoiceSummaryTotals.paid} title="Total Paid" />
  </div>

  <PaginatedList
    items={invoices.items}
    paginationMetadata={invoices.paginationMetadata}
    pending={$effect.pending() > 0}
  >
    {#snippet header()}
      <InvoiceRowHeader />
    {/snippet}
    {#snippet skeleton()}
      <InvoiceRowSkeleton />
    {/snippet}
    {#snippet row(item)}
      <InvoiceRow
        invoice={item}
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
    {#snippet footer()}
      <CircledAmount amount={invoiceSummaryTotals.grandTotal} label="Total" />
    {/snippet}
  </PaginatedList>
</svelte:boundary>

<Modal onClose={formPanel.close} variant="panel" {@attach formPanel.attach}>
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
      Add a Client
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class={css({ display: "none" })}>""</h2>
  {/snippet}

  {#if isEditing === "edit"}
    <ClientForm closePanel={formPanel.close} edit={client} formState="edit" />
  {:else}
    <ClientForm
      closePanel={formPanel.close}
      edit={undefined}
      formState="create"
    />
  {/if}
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
    <h2 class={css({ display: "none" })}>Edit an invoice</h2>
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
        listClientInvoices({ clientId, listQuery: listArg }).withOverride(
          (current) => omitListItem(current, item.id)
        ),
        clientInvoiceSummary(summaryArg).withOverride((current) =>
          applyDeletedInvoiceToSummary(current, item)
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
  {#snippet descriptionSnippet(item)}
    This will delete the invoice to
    <span class={css({ color: "scarlet" })}>{item?.name ?? "Unknown"}</span>
    for
    <span class={css({ color: "scarlet" })}
      >{formatTotal(item?.total ?? 0)}</span
    >
  {/snippet}
</ConfirmDelete>
