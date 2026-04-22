<script lang="ts">
  import type { ClientInsert } from "$features/clients/types";
  import type {
    LineItemEditRow,
    NewLineItemWithId,
  } from "$features/line-items/types";
  import { toNormalizedListQuery } from "$features/pagination/utils/list-query";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import Trash from "$lib/components/icons/Trash.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { Counter } from "$lib/runes/Counter.svelte";
  import { ItemPanel } from "$lib/runes/ItemPanel.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { BitsButton, CursorId, Maybe } from "$lib/types";
  import { toDateInputValue } from "$lib/utils/dateHelpers";
  import { isAbortError } from "$lib/utils/error-message";
  import { formatTotal, sumLineItems } from "$lib/utils/moneyHelpers";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import type { FormEventHandler } from "svelte/elements";
  import type {
    InvoiceDeleteConfirmItem,
    InvoiceSelect,
    NewInvoice,
  } from "../types";
  import {
    computeInvoicePatchDelta,
    pickInvoicePatchSnapshot,
    serializedNormalizedLineItemsForCompare,
    type InvoicePatchSnapshot,
  } from "../utils/invoice-diff";
  import InvoiceFormLayout from "./InvoiceFormLayout.svelte";

  let {
    closePanel,
    invoiceEdit,
  }: {
    closePanel: () => void;
    invoiceEdit: InvoiceSelect;
  } = $props();

  const {
    clients: clientsStore,
    invoices: invoicesStore,
    lineItems: lineItemsStore,
  } = getDashboardStores();

  type EditableInvoice = NewInvoice & Pick<InvoiceSelect, "id">;

  let invoice: EditableInvoice = $state({
    ...invoiceEdit,
    issueDate: toDateInputValue(invoiceEdit.issueDate),
    dueDate: toDateInputValue(invoiceEdit.dueDate),
  });

  const counter = new Counter();

  let lineItems: Array<NewLineItemWithId | LineItemEditRow> = $state([
    lineItemsStore.newLineItem(counter.increment()),
  ]);
  let lineItemsLoaded = $state(false);

  let isNewClient = $state(false);
  let newClient: ClientInsert = $state(clientsStore.newClient());

  let baselineInvoiceSnapshot: InvoicePatchSnapshot | null = null;
  let baselineLineItemsSnapshot: string | null = null;

  let abortController: AbortController | null = null;
  let isMounted = true;

  onMount(async () => {
    abortController = new AbortController();
    const signal = abortController.signal;

    // TODO: Panel-scoped retry, inline error state, and clearer copy (avoid relying only on toasts).
    try {
      const [, items] = await Promise.all([
        clientsStore.loadClientPickerOptions(signal),
        lineItemsStore.loadLineItemsByInvoiceId(invoiceEdit.id, { signal }),
      ]);

      if (!isMounted) return;
      if (items == null) return;

      lineItems =
        items.length > 0
          ? items
          : [lineItemsStore.newLineItem(counter.increment())];

      baselineInvoiceSnapshot = pickInvoicePatchSnapshot(invoiceEdit);
      baselineLineItemsSnapshot = serializedNormalizedLineItemsForCompare(
        lineItemsStore.normalizeLineItems(lineItems)
      );
    } catch (err) {
      abortController?.abort();
      if (!isAbortError(err)) {
        toast.error("Failed to load invoice form");
      }
    } finally {
      if (isMounted) {
        lineItemsLoaded = true;
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

    let clientId: Maybe<CursorId> = invoice.clientId ?? null;
    if (isNewClient) {
      clientId = await clientsStore.createClient(newClient);
      if (!clientId) {
        toast.error("Failed to create client");
        return;
      }
    }

    if (!clientId) {
      toast.error("Client is required");
      return;
    }

    if (!lineItemsLoaded) {
      toast.error("Still loading invoice");
      return;
    }

    if (
      baselineInvoiceSnapshot === null ||
      baselineLineItemsSnapshot === null ||
      !invoice.id
    ) {
      toast.error("Invoice not ready");
      return;
    }

    const updatedInvoice = {
      ...invoice,
      clientId,
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate),
    };

    const currentSnapshot = pickInvoicePatchSnapshot(updatedInvoice);
    const delta = computeInvoicePatchDelta(
      baselineInvoiceSnapshot,
      currentSnapshot
    );

    const normalizedLineItemsNow = lineItemsStore.normalizeLineItems(lineItems);
    const lineItemsSnap = serializedNormalizedLineItemsForCompare(
      normalizedLineItemsNow
    );

    const invoiceUnchanged = Object.keys(delta).length === 0;
    const lineItemsUnchanged = lineItemsSnap === baselineLineItemsSnapshot;

    if (invoiceUnchanged && lineItemsUnchanged) {
      toast.info("No changes to save");
      return;
    }

    let effectiveInvoiceId: CursorId = invoice.id;

    if (!invoiceUnchanged) {
      const updatedId = await invoicesStore.updateInvoice(invoice.id, delta);
      if (!updatedId) {
        toast.error("Failed to update invoice");
        return;
      }
      effectiveInvoiceId = updatedId;
    }

    if (!lineItemsUnchanged) {
      const lineResult = await lineItemsStore.updateLineItems(
        effectiveInvoiceId,
        normalizedLineItemsNow
      );
      if (lineResult === null) return;
    }

    await invoicesStore.loadItems(toNormalizedListQuery(undefined, {}));
    closePanel();
  };
</script>

<InvoiceFormLayout
  onsubmit={handleSubmit}
  bind:invoice
  bind:lineItems
  bind:isNewClient
  bind:newClient
  {lineItemsLoaded}
  mode="edit"
  {closePanel}
  {addLineItem}
>
  {#snippet buttons()}
    <Button
      variant="textOnlyDestructive"
      onclick={() => {
        if (!invoice.id) return;
        deleteModal.open({
          id: invoice.id,
          name: clientName,
          total: sumLineItems(lineItems),
        });
      }}><Trash />Delete</Button
    >
  {/snippet}
</InvoiceFormLayout>

{#if deleteModal.item}
  <ConfirmDelete
    item={deleteModal.item}
    bind:open={deleteModal.toggle.isOn}
    titleText="Are you sure you want to delete this invoice?"
    onCancel={deleteModal.close}
    onDelete={async () => {
      if (!deleteModal.item?.id) return;
      await invoicesStore.deleteInvoice(deleteModal.item.id);
      deleteModal.close();
      closePanel();
    }}
  >
    {#snippet descriptionSnippet(inv)}
      This will delete the invoice to <span class="text-scarlet"
        >{inv.name}</span
      >
      for
      <span class="text-scarlet">{totalDisplay}</span>
    {/snippet}
  </ConfirmDelete>
{/if}
