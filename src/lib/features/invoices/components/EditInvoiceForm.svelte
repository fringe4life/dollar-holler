<script lang="ts">
  import { css } from "styled-system/css";
  import { onDestroy } from "svelte";
  import type { FormEventHandler } from "svelte/elements";
  import {
    clientPickerOptions,
    createClient,
  } from "#features/clients/clients.remote";
  import type { ClientInsert } from "#features/clients/types";
  import { newClient } from "#features/clients/utils/new-client";
  import {
    deleteInvoice,
    getInvoice,
    listInvoices,
    updateInvoice,
  } from "#features/invoices/invoices.remote";
  import {
    listLineItemsForEdit,
    replaceLineItems,
  } from "#features/line-items/line-items.remote";
  import type {
    LineItemEditRow,
    NewLineItemWithId,
  } from "#features/line-items/types";
  import {
    newLineItem,
    normalizeLineItems,
  } from "#features/line-items/utils/line-item-form";
  import { toNormalizedListQuery } from "#features/pagination/utils/list-query";
  import { Counter } from "#lib/client/runes/Counter.svelte";
  import { ItemPanel } from "#lib/client/runes/ItemPanel.svelte";
  import ConfirmDelete from "#lib/components/ConfirmDelete.svelte";
  import Trash from "#lib/components/icons/Trash.svelte";
  import Button from "#lib/components/ui/button/button.svelte";
  import type { BitsButton, CursorId } from "#lib/types";
  import { toDateInputValue } from "#lib/utils/dateHelpers";
  import { getErrorMessage } from "#lib/utils/error-message";
  import { formatTotal, sumLineItems } from "#lib/utils/moneyHelpers";
  import { toast } from "#lib/utils/toast.svelte";
  import type {
    InvoiceDeleteConfirmItem,
    InvoiceSelect,
    NewInvoice,
  } from "../types";
  import {
    assertEditReady,
    buildEditPatch,
    type InvoicePatchSnapshot,
    pickInvoicePatchSnapshot,
    serializedNormalizedLineItemsForCompare,
  } from "../utils/invoice-diff";
  import { persistInvoiceEdits } from "../utils/persist-invoice-edits";
  import { resolveClientId } from "../utils/resolve-client-id";
  import InvoiceFormLayout from "./InvoiceFormLayout.svelte";

  interface EditInvoiceFormProps {
    closePanel: () => void;
    invoiceId: CursorId;
  }

  let { closePanel, invoiceId }: EditInvoiceFormProps = $props();

  const picker = await clientPickerOptions();
  // svelte-ignore state_referenced_locally -- parent remounts via {#key invoiceId}
  const loadedInvoice = await getInvoice(invoiceId);
  // svelte-ignore state_referenced_locally -- parent remounts via {#key invoiceId}
  const loadedLineItems = await listLineItemsForEdit(invoiceId);

  type EditableInvoice = NewInvoice & Pick<InvoiceSelect, "id">;

  const toEditableInvoice = (full: InvoiceSelect): EditableInvoice => ({
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

  let invoice: EditableInvoice = $state(toEditableInvoice(loadedInvoice));

  const counter = new Counter();

  let lineItems: Array<NewLineItemWithId | LineItemEditRow> = $state(
    loadedLineItems.length > 0
      ? loadedLineItems
      : [newLineItem(counter.increment())]
  );
  const baselinesReady = true;

  let isNewClient = $state(false);
  let newClientState: ClientInsert = $state(newClient());

  let baselineInvoiceSnapshot: InvoicePatchSnapshot | null =
    pickInvoicePatchSnapshot(loadedInvoice);
  // svelte-ignore state_referenced_locally -- seed baseline from initial line items
  let baselineLineItemsSnapshot: string | null =
    serializedNormalizedLineItemsForCompare(normalizeLineItems(lineItems));

  onDestroy(() => {
    counter.reset();
    baselineInvoiceSnapshot = null;
    baselineLineItemsSnapshot = null;
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

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      const client = await resolveClientId({
        createClient: async (clientData) => {
          const created = await createClient(clientData);
          return created.id;
        },
        existingClientId: invoice.clientId,
        isNewClient,
        newClient: newClientState,
      });
      if (!client.ok) {
        toast.error(client.message);
        return;
      }

      const ready = assertEditReady({
        baselineInvoiceSnapshot,
        baselineLineItemsSnapshot,
        formReady: baselinesReady,
        invoiceId: invoice.id,
      });
      if (!ready.ok) {
        toast.error(ready.message);
        return;
      }

      const patch = buildEditPatch({
        baselineInvoiceSnapshot: ready.baselineInvoiceSnapshot,
        baselineLineItemsSnapshot: ready.baselineLineItemsSnapshot,
        clientId: client.clientId,
        invoice,
        lineItems,
        normalizeLineItems,
      });

      if (patch.unchanged) {
        toast.info("No changes to save");
        return;
      }

      const saved = await persistInvoiceEdits({
        delta: patch.delta,
        invoiceId: ready.invoiceId,
        invoiceUnchanged: patch.invoiceUnchanged,
        lineItemsUnchanged: patch.lineItemsUnchanged,
        normalizedLineItems: patch.normalizedLineItems,
        updateInvoice: async (id, delta) => {
          const result = await updateInvoice({ id, patch: delta });
          return result.id;
        },
        updateLineItems: async (id, items) =>
          replaceLineItems({ invoiceId: id, lineItems: items }),
      });
      if (!saved.ok) {
        if (saved.message) {
          toast.error(saved.message);
        }
        return;
      }

      await listInvoices(toNormalizedListQuery(undefined, {})).refresh();
      closePanel();
      toast.success("Invoice updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update invoice"));
    }
  };
</script>

<InvoiceFormLayout
  {addLineItem}
  clientOptions={picker.options}
  {closePanel}
  lineItemsLoaded={baselinesReady}
  mode="edit"
  onsubmit={handleSubmit}
  bind:invoice
  bind:isNewClient
  bind:lineItems
  bind:newClient={newClientState}
>
  {#snippet buttons()}
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
  {/snippet}
</InvoiceFormLayout>

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
  {#snippet descriptionSnippet(_invoice)}
    This will delete the invoice to
    <span class={css({ color: "scarlet" })}>{_invoice?.name ?? "Unknown"}</span>
    for
    <span class={css({ color: "scarlet" })}>{totalDisplay}</span>
  {/snippet}
</ConfirmDelete>
