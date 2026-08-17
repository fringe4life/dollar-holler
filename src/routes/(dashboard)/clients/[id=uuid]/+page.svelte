<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { between } from "#styled-system/patterns/index.js";
  import { page } from "$app/state";
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
  import { normalizeListQueryFromUrl } from "#features/pagination/utils/list-query.ts";
  import { omitListItem } from "#features/pagination/utils/omit-list-item.ts";
  import { visibleListUrl } from "#features/pagination/utils/url.ts";
  import {
    ItemPanel,
    upsertKey,
    type UpsertTarget,
  } from "#lib/client/runes/ItemPanel.svelte.ts";
  import BoundaryError from "#lib/components/BoundaryError.svelte";
  import ConfirmDelete from "#lib/components/ConfirmDelete.svelte";
  import FormPanel from "#lib/components/FormPanel.svelte";
  import Edit from "#lib/components/icons/Edit.svelte";
  import Spinner from "#lib/components/Spinner.svelte";
  import Button from "#lib/components/ui/button/button.svelte";
  import type { BitsButton, CursorId } from "#lib/types.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";
  import { formatTotal } from "#lib/utils/moneyHelpers.ts";
  import { toast } from "#lib/utils/toast.svelte.ts";

  const listArg = $derived(
    normalizeListQueryFromUrl(visibleListUrl(page)).normalized
  );
  const clientId = $derived(page.params.id as CursorId);
  const summaryArg = $derived(
    listArg.q === undefined ? { clientId } : { clientId, q: listArg.q }
  );
  const client = $derived(await getClient(clientId));

  const formPanel = new ItemPanel<UpsertTarget<ClientSelect>>();
  const invoicePanel = new ItemPanel<CursorId>();
  const deleteModal = new ItemPanel<InvoiceListResponse>();
  const formTarget = $derived(formPanel.item);
  const isEdit = $derived(formTarget?.kind === "edit");

  const handleEdit: BitsButton = () => {
    formPanel.open({ kind: "edit", item: client });
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
<ItemsHeader open={() => formPanel.open({ kind: "create" })}>
  {#snippet button()}
    + Client
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

  <div class={between({ marginBlockEnd: 7, inlineSize: "full" })}>
    <h1
      class={css({ color: "daisyBush", fontSize: "3xl", fontWeight: "bold" })}
    >
      {client.name}
    </h1>
    <Button onclick={handleEdit} variant="textOnly"><Edit /> Edit</Button>
  </div>
</svelte:boundary>

<ClientInvoiceSummary {clientId} q={listArg.q} />
<ClientInvoiceList
  {clientId}
  listQuery={listArg}
  onDelete={deleteModal.open}
  onEdit={(inv) => invoicePanel.open(inv.id)}
  onSendInvoice={handleSendInvoice}
/>

<FormPanel
  attach={formPanel.attach}
  descriptionText={isEdit ? "Edit a client" : "Create a new client"}
  onClose={formPanel.close}
  titleText={isEdit ? "Edit a Client" : "Add a Client"}
>
  {#if formTarget}
    {#key upsertKey(formTarget, (selected) => selected.id)}
      {#if formTarget.kind === "edit"}
        <ClientForm
          closePanel={formPanel.close}
          edit={formTarget.item}
          formState="edit"
        />
      {:else}
        <ClientForm
          closePanel={formPanel.close}
          edit={undefined}
          formState="create"
        />
      {/if}
    {/key}
  {/if}
</FormPanel>

<FormPanel
  attach={invoicePanel.attach}
  descriptionText="Edit an invoice"
  onClose={invoicePanel.close}
  titleText="Edit an Invoice"
>
  {#if invoicePanel.item}
    {#key invoicePanel.item}
      <InvoiceForm
        closePanel={invoicePanel.close}
        invoiceId={invoicePanel.item}
        mode="edit"
      />
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
    <span class={css({ color: "scarlet" })}>{item?.name ?? "Unknown"}</span>
    for
    <span class={css({ color: "scarlet" })}
      >{formatTotal(item?.total ?? 0)}</span
    >
  {/snippet}
</ConfirmDelete>
