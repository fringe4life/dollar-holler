<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { flex } from "#styled-system/patterns/index.js";
  import { onDestroy } from "svelte";
  import { getToast } from "#lib/components/patterns/toast/toaster.svelte.ts";
  import { clientPickerOptions } from "#features/clients/clients.remote.ts";
  import type { ClientInsert } from "#features/clients/types.ts";
  import { newClient } from "#features/clients/utils/new-client.ts";
  import {
    deleteInvoice,
    getInvoice,
    saveInvoice,
  } from "#features/invoices/invoices.remote.ts";
  import { listLineItemsForEdit } from "#features/line-items/line-items.remote.ts";
  import type {
    InvoiceFormProps,
    LineItemEditRow,
    NewLineItemWithId,
  } from "#features/line-items/types.ts";
  import { newLineItem } from "#features/line-items/utils/line-item-form.ts";
  import { Counter } from "#lib/client/runes/Counter.svelte.ts";
  import { ItemPanel } from "#lib/components/patterns/item-panel/ItemPanel.svelte.ts";
  import ConfirmDelete from "#lib/components/patterns/ConfirmDelete.svelte";
  import Form from "#lib/components/patterns/form/Form.svelte";
  import Check from "#lib/components/primitives/icons/Check.svelte";
  import Trash from "#lib/components/primitives/icons/Trash.svelte";
  import Button from "#lib/components/primitives/button/button.svelte";
  import LoaderButton from "#lib/components/primitives/button/LoaderButton.svelte";
  import { buttonIcon } from "#lib/styles.ts";
  import type { BitsButton } from "#lib/types.ts";
  import { toDateInputValue } from "#lib/utils/dateHelpers.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";
  import { formatTotal, sumLineItems } from "#lib/utils/moneyHelpers.ts";
  import type {
    InvoiceDeleteConfirmItem,
    InvoiceSelect,
    NewInvoice,
  } from "../types";
  import { newInvoice } from "../utils/new-invoice";
  import InvoiceFormLayout from "./InvoiceFormLayout.svelte";

  let { mode = "create", closePanel, invoiceId }: InvoiceFormProps = $props();
  const toast = getToast();

  const picker = await clientPickerOptions();
  // svelte-ignore state_referenced_locally -- parent remounts via {#key}
  const editInvoiceId = mode === "edit" ? invoiceId : undefined;
  const loadedInvoice = editInvoiceId ? await getInvoice(editInvoiceId) : null;
  const loadedLineItems = editInvoiceId
    ? await listLineItemsForEdit(editInvoiceId)
    : [];

  const toEditableInvoice = (full: InvoiceSelect): NewInvoice => ({
    clientId: full.clientId,
    discount: full.discount ?? 0,
    dueDate: toDateInputValue(full.dueDate),
    id: full.id,
    invoiceNumber: full.invoiceNumber,
    invoiceStatus: full.invoiceStatus ?? "draft",
    issueDate: toDateInputValue(full.issueDate),
    notes: full.notes ?? null,
    subject: full.subject,
    terms: full.terms ?? null,
  });

  let invoice: NewInvoice = $state(
    loadedInvoice ? toEditableInvoice(loadedInvoice) : newInvoice()
  );

  const counter = new Counter();

  let lineItems: Array<NewLineItemWithId | LineItemEditRow> = $state(
    loadedLineItems.length > 0
      ? loadedLineItems
      : [newLineItem(counter.increment())]
  );

  let isNewClient = $state(false);
  let newClientState: ClientInsert = $state(newClient());

  onDestroy(() => {
    counter.reset();
  });

  const addLineItem: BitsButton = () => {
    lineItems.push(newLineItem(counter.increment()));
  };

  const clientName = $derived(
    picker.options.find((c) => c.id === invoice.clientId)?.name ?? "Unknown"
  );
  const totalDisplay = $derived(
    formatTotal(sumLineItems(lineItems), invoice.discount)
  );

  const deleteModal = new ItemPanel<InvoiceDeleteConfirmItem>();

  const handleSaved = () => {
    toast.success(
      mode === "edit"
        ? "Invoice updated successfully"
        : "Invoice created successfully"
    );
    closePanel();
  };
</script>

<Form onSuccess={handleSaved} remote={saveInvoice}>
  {#if invoice.id}
    <input {...saveInvoice.fields.id.as("hidden", invoice.id)} />
  {/if}
  <InvoiceFormLayout
    {addLineItem}
    clientOptions={picker.options}
    {mode}
    bind:invoice
    bind:isNewClient
    bind:lineItems
    bind:newClient={newClientState}
  />
  {#snippet submit({ pending })}
    <div
      class={flex({
        alignItems: "center",
        justifyContent: "space-between",
        gap: 5,
        marginBlockStart: 5,
      })}
    >
      {#if mode === "edit" && invoice.id}
        <Button
          onclick={() => {
            if (!invoice.id) {
              return;
            }
            deleteModal.open({
              id: invoice.id,
              name: clientName,
              total: sumLineItems(lineItems),
            });
          }}
          variant="textOnlyDestructive"><Trash />Delete</Button
        >
      {:else}
        <span></span>
      {/if}
      <div class={flex({ gap: 5 })}>
        <Button onclick={() => closePanel()} variant="secondary">Cancel</Button>
        <LoaderButton class="group" {pending}
          ><Check class={buttonIcon("check")} /> Save</LoaderButton
        >
      </div>
    </div>
  {/snippet}
</Form>

{#if mode === "edit"}
  <ConfirmDelete
    item={deleteModal.item}
    onCancel={deleteModal.close}
    {@attach deleteModal.attach}
    onDelete={async () => {
      if (!deleteModal.item?.id) {
        return;
      }
      try {
        await deleteInvoice({ id: deleteModal.item.id });
        toast.success("Invoice deleted successfully");
        deleteModal.close();
        closePanel();
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to delete invoice"));
      }
    }}
    titleText="Are you sure you want to delete this invoice?"
  >
    {#snippet descriptionSnippet(_item)}
      This will delete the invoice to
      <span class={css({ color: "scarlet" })}>{clientName}</span>
      for
      <span class={css({ color: "scarlet" })}>{totalDisplay}</span>
    {/snippet}
  </ConfirmDelete>
{/if}
