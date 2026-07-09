<script lang="ts">
  import { css } from "styled-system/css";
  import { onDestroy, onMount } from "svelte";
  import type { FormEventHandler } from "svelte/elements";
  import type { ClientInsert } from "$features/clients/types";
  import type {
    LineItemEditRow,
    NewLineItemWithId,
  } from "$features/line-items/types";
  import { toNormalizedListQuery } from "$features/pagination/utils/list-query";
  import { Counter } from "$lib/client/runes/Counter.svelte";
  import { ItemPanel } from "$lib/client/runes/ItemPanel.svelte";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import Trash from "$lib/components/icons/Trash.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { BitsButton, CursorId } from "$lib/types";
  import { toDateInputValue } from "$lib/utils/dateHelpers";
  import { isAbortError } from "$lib/utils/error-message";
  import { formatTotal, sumLineItems } from "$lib/utils/moneyHelpers";
  import { toast } from "$lib/utils/toast.svelte";
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

  const {
    clients: clientsStore,
    invoices: invoicesStore,
    lineItems: lineItemsStore,
  } = getDashboardStores();

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

  // svelte-ignore state_referenced_locally
  let invoice: EditableInvoice = $state({
    ...invoicesStore.newInvoice(),
    id: invoiceId,
  });

  const counter = new Counter();

  let lineItems: Array<NewLineItemWithId | LineItemEditRow> = $state([
    lineItemsStore.newLineItem(counter.increment()),
  ]);
  let invoiceLoaded = $state(false);
  let lineItemsLoaded = $state(false);
  const formReady = $derived(invoiceLoaded && lineItemsLoaded);

  let isNewClient = $state(false);
  let newClient: ClientInsert = $state(clientsStore.newClient());

  let baselineInvoiceSnapshot: InvoicePatchSnapshot | null = null;
  let baselineLineItemsSnapshot: string | null = null;

  let abortController: AbortController | null = null;
  let isMounted = true;

  onMount(async () => {
    abortController = new AbortController();
    const { signal } = abortController;

    try {
      const [fullInvoice, items] = await Promise.all([
        invoicesStore.loadInvoiceById(invoiceId, { signal }),
        lineItemsStore.loadLineItemsByInvoiceId(invoiceId, { signal }),
        clientsStore.loadClientPickerOptions(signal),
      ]);

      if (!isMounted) {
        return;
      }

      if (!fullInvoice) {
        closePanel();
        return;
      }

      invoice = toEditableInvoice(fullInvoice);
      invoiceLoaded = true;

      if (!items) {
        return;
      }

      lineItems =
        items.length > 0
          ? items
          : [lineItemsStore.newLineItem(counter.increment())];

      baselineInvoiceSnapshot = pickInvoicePatchSnapshot(fullInvoice);
      baselineLineItemsSnapshot = serializedNormalizedLineItemsForCompare(
        lineItemsStore.normalizeLineItems(lineItems)
      );
      lineItemsLoaded = true;
    } catch (err) {
      abortController?.abort();
      if (!isAbortError(err)) {
        toast.error("Failed to load invoice form");
        closePanel();
      }
    }
  });

  onDestroy(() => {
    isMounted = false;
    abortController?.abort();
    counter.reset();
    baselineInvoiceSnapshot = null;
    baselineLineItemsSnapshot = null;
  });

  const addLineItem: BitsButton = () => {
    lineItems.push(lineItemsStore.newLineItem(counter.increment()));
  };

  const clientName = $derived(
    clientsStore.clientPickerOptions.find((c) => c.id === invoice.clientId)
      ?.name ?? "Unknown"
  );
  const totalDisplay = $derived(
    formatTotal(sumLineItems(lineItems), invoice.discount)
  );

  const deleteModal = new ItemPanel<InvoiceDeleteConfirmItem>();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const client = await resolveClientId({
      createClient: (clientData) => clientsStore.createClient(clientData),
      existingClientId: invoice.clientId,
      isNewClient,
      newClient,
    });
    if (!client.ok) {
      toast.error(client.message);
      return;
    }

    const ready = assertEditReady({
      baselineInvoiceSnapshot,
      baselineLineItemsSnapshot,
      formReady,
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
      normalizeLineItems: (items) => lineItemsStore.normalizeLineItems(items),
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
      updateInvoice: (id, delta) => invoicesStore.updateInvoice(id, delta),
      updateLineItems: (id, items) => lineItemsStore.updateLineItems(id, items),
    });
    if (!saved.ok) {
      if (saved.message) {
        toast.error(saved.message);
      }
      return;
    }

    await invoicesStore.loadItems(toNormalizedListQuery(undefined, {}));
    closePanel();
  };
</script>

<InvoiceFormLayout
  {addLineItem}
  {closePanel}
  lineItemsLoaded={formReady}
  mode="edit"
  onsubmit={handleSubmit}
  bind:invoice
  bind:isNewClient
  bind:lineItems
  bind:newClient
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
  dialogEl={deleteModal?.dialogEl}
  item={deleteModal.item}
  onCancel={deleteModal.close}
  onDelete={async () => {
    if (!deleteModal.item?.id) {
      return;
    }
    await invoicesStore.deleteInvoice(deleteModal.item.id);
    deleteModal.close();
    closePanel();
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
