<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { page } from "$app/state";
  import { getToast } from "#lib/components/patterns/toast/toaster.svelte.ts";
  import { money } from "#lib/components/primitives/money/money.ts";
  import ClientForm from "#features/clients/components/ClientForm.svelte";
  import ClientInvoiceList from "#features/clients/components/ClientInvoiceList.svelte";
  import ClientInvoiceSummary from "#features/clients/components/ClientInvoiceSummary.svelte";
  import {
    clientInvoiceSummary,
    getClient,
    listClientInvoices,
  } from "#features/clients/clients.remote.ts";
  import type { ClientSelect } from "#features/clients/types.ts";
  import InvoiceForm from "#features/invoices/components/InvoiceForm.svelte";
  import {
    deleteInvoice,
    updateInvoiceStatus,
  } from "#features/invoices/invoices.remote.ts";
  import type { InvoiceListResponse } from "#features/invoices/types.ts";
  import {
    applyDeletedInvoiceToSummary,
    applySentInvoiceToSummary,
  } from "#features/invoices/utils/client-invoice-summary.ts";
  import ItemsHeader from "#features/pagination/components/ItemsHeader.svelte";
  import { readListQuery } from "#features/pagination/utils/list-query.ts";
  import { omitListItem } from "#features/pagination/utils/omit-list-item.ts";
  import { buttonIcon } from "#lib/styles.ts";
  import {
    ItemPanel,
    upsertKey,
    type UpsertTarget,
  } from "#lib/components/patterns/item-panel/ItemPanel.svelte.ts";
  import BoundaryError from "#lib/components/patterns/BoundaryError.svelte";
  import ConfirmDelete from "#lib/components/patterns/ConfirmDelete.svelte";
  import FormPanel from "#lib/components/patterns/form/FormPanel.svelte";
  import Spinner from "#lib/components/primitives/Spinner.svelte";
  import type { BitsButton } from "#lib/types.ts";
  import type { CursorId } from "#lib/schemas/cursor-id.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";
  import { formatTotal } from "#lib/utils/moneyHelpers.ts";

  import type { PageProps } from "./$types";

  let { params }: PageProps = $props();
  const toast = getToast();
  const clientId = $derived(params.id); // CursorId, no assert

  const listArg = $derived(readListQuery(page));
  const summaryArg = $derived(
    listArg.q === undefined ? { clientId } : { clientId, q: listArg.q }
  );
  const client = $derived(await getClient(clientId));

  // Creating clients belongs to /clients; this route only edits the one client.
  const formPanel = new ItemPanel<ClientSelect>();
  const invoicePanel = new ItemPanel<UpsertTarget<CursorId>>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();
  const editTarget = $derived(formPanel.item);
  const invoiceTarget = $derived(invoicePanel.item);
  const isInvoiceEdit = $derived(invoiceTarget?.kind === "edit");

  const handleEdit: BitsButton = () => {
    formPanel.open(client);
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

<svelte:head>
  <title>{client.name} | Doller Holla</title>
  <meta
    content="Client profile and invoices for {client.name} in Dollar Holler."
    name="description"
  />
</svelte:head>
<ItemsHeader open={() => invoicePanel.open({ kind: "create" })}>
  {#snippet button()}
    <span aria-hidden="true" class={buttonIcon({ icon: "plus" })}>+</span>
    Invoice
  {/snippet}
</ItemsHeader>

<svelte:boundary>
  {#snippet pending()}
    <Spinner label="Loading client" size="lg" />
  {/snippet}
  {#snippet failed(err, reset)}
    <BoundaryError
      error={err}
      fallbackMessage="Failed to load client"
      onRetry={reset}
      title="We couldn't load this client"
    />
  {/snippet}

  <ClientInvoiceSummary {client} {clientId} onEdit={handleEdit} q={listArg.q} />
  <ClientInvoiceList
    {clientId}
    listQuery={listArg}
    onDelete={deleteModal.open}
    onEdit={(inv) => invoicePanel.open({ item: inv.id, kind: "edit" })}
    onSendInvoice={handleSendInvoice}
  />
</svelte:boundary>

<FormPanel
  attach={formPanel.attach}
  descriptionText="Edit this client's details"
  onClose={formPanel.close}
  titleText="Edit a Client"
>
  {#if editTarget}
    {#key editTarget.id}
      <ClientForm
        closePanel={formPanel.close}
        edit={editTarget}
        formState="edit"
      />
    {/key}
  {/if}
</FormPanel>

<FormPanel
  attach={invoicePanel.attach}
  descriptionText={isInvoiceEdit
    ? "Edit an invoice"
    : "Create a new invoice for this client"}
  onClose={invoicePanel.close}
  titleText={isInvoiceEdit ? "Edit an Invoice" : "Add an Invoice"}
>
  {#if invoiceTarget}
    {#key upsertKey(invoiceTarget, (id) => String(id))}
      {#if invoiceTarget.kind === "edit"}
        <InvoiceForm
          closePanel={invoicePanel.close}
          invoiceId={invoiceTarget.item}
          mode="edit"
        />
      {:else}
        <InvoiceForm
          clientId={client.id}
          closePanel={invoicePanel.close}
          mode="create"
        />
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
    <span class={css({ color: "destructive" })}>{item?.name ?? "Unknown"}</span>
    for
    <span class={cx(money(), css({ color: "destructive" }))}
      >{formatTotal(item?.total ?? 0)}</span
    >
  {/snippet}
</ConfirmDelete>
