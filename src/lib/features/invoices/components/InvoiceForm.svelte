<script lang="ts">
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import Trash from "$lib/components/icons/Trash.svelte";
  import States from "$lib/components/States.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { ClientInsert } from "$lib/features/clients/types";
  import LineItemRows from "$lib/features/line-items/components/LineItemRows.svelte";
  import LineItemSkeleton from "$lib/features/line-items/components/LineItemSkeleton.svelte";
  import type {
    InvoiceFormProps,
    Key,
    LineItemEditRow,
    LineItemUpdate,
    NewLineItemWithId,
  } from "$lib/features/line-items/types";
  import { toNormalizedListQuery } from "$lib/features/pagination/utils/list-query";
  import { Counter } from "$lib/runes/Counter.svelte";
  import { ItemPanel } from "$lib/runes/ItemPanel.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { BitsButton, CursorId, Maybe } from "$lib/types";
  import { toDateInputValue, today } from "$lib/utils/dateHelpers";
  import { formatTotal, sumLineItems } from "$lib/utils/moneyHelpers";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import type { FormEventHandler } from "svelte/elements";
  import { slide } from "svelte/transition";
  import {
    computeInvoicePatchDelta,
    pickInvoicePatchSnapshot,
    serializedNormalizedLineItemsForCompare,
    type InvoicePatchSnapshot,
  } from "../invoice-diff";
  import type { InvoiceDeleteConfirmItem, NewInvoice } from "../types";

  let {
    mode = "create",
    closePanel,
    invoiceEdit = $bindable(),
  }: InvoiceFormProps = $props();

  const {
    clients: clientsStore,
    invoices: invoicesStore,
    lineItems: lineItemsStore,
  } = getDashboardStores();

  // Form data using NewInvoice type
  let invoice: NewInvoice = $state(invoicesStore.newInvoice());

  const counter = new Counter();

  let lineItems: Array<NewLineItemWithId | LineItemEditRow> = $state([
    lineItemsStore.newLineItem({
      id: counter.increment(),
    }),
  ]);
  let lineItemsLoaded = $state(true);

  /** Edit mode: last saved header snapshot for PATCH deltas. */
  let baselineInvoiceSnapshot: InvoicePatchSnapshot | null = null;
  /** Edit mode: serialized normalized line items at load (see invoice-diff). */
  let baselineLineItemsSnapshot: string | null = null;

  let abortController: AbortController | null = null;
  let isMounted = true;

  onMount(async () => {
    try {
      await clientsStore.loadClientPickerOptions();
    } catch {
      toast.error("Failed to load clients");
    }

    if (mode === "edit" && invoiceEdit?.id) {
      const editId = invoiceEdit.id;
      // Date inputs require "yyyy-MM-dd"; convert from Date objects
      const issueDate = toDateInputValue(invoiceEdit.issueDate);
      const dueDate = toDateInputValue(invoiceEdit.dueDate);
      invoice = { ...invoiceEdit, issueDate, dueDate };

      lineItemsLoaded = false;
      abortController = new AbortController();

      const items = await lineItemsStore.loadLineItemsByInvoiceId(editId, {
        signal: abortController.signal,
      });

      if (isMounted) {
        if (items && items.length > 0) {
          lineItems = items;
        } else {
          lineItems = [
            lineItemsStore.newLineItem({
              id: counter?.increment(),
            }),
          ];
        }
        lineItemsLoaded = true;

        baselineInvoiceSnapshot = pickInvoicePatchSnapshot(invoiceEdit);
        baselineLineItemsSnapshot = serializedNormalizedLineItemsForCompare(
          lineItemsStore.normalizeLineItems(lineItems)
        );
      }
    }
  });

  onDestroy(() => {
    isMounted = false;
    abortController?.abort();
    // TODO: delete the counter to free up memory
    counter.reset();
    baselineInvoiceSnapshot = null;
    baselineLineItemsSnapshot = null;
  });

  const addLineItem: BitsButton = () => {
    lineItems.push(
      lineItemsStore.newLineItem({
        id: counter.increment(),
      })
    );
  };

  const removeLineItem = (id: Key) => {
    const index = lineItems.findIndex((lineItem) => lineItem.id === id);
    if (index !== -1) lineItems.splice(index, 1);
  };

  const updateLineItem = (id: Key, patch: LineItemUpdate) => {
    const index = lineItems.findIndex((lineItem) => lineItem.id === id);
    if (index !== -1) lineItems[index] = { ...lineItems[index], ...patch };
  };

  const setDiscount = (value: number) => {
    invoice = { ...invoice, discount: value };
  };

  let isNewClient = $state<boolean>(false);

  let newClient: ClientInsert = $state(clientsStore.newClient());

  const clientName = $derived(
    clientsStore.clientPickerOptions.find((c) => c.id === invoice.clientId)
      ?.name ?? "Unknown"
  );
  const totalDisplay = $derived(
    formatTotal(sumLineItems(lineItems), invoice.discount)
  );

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // --- Resolve client id (inline "new client" flow or existing select) ---
    let clientId: Maybe<CursorId> = invoiceEdit?.clientId ?? null;
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

    // --- Wire-shaped invoice for API + diff: Date fields (form uses yyyy-MM-dd strings) ---
    const updatedInvoice = {
      ...invoice,
      clientId,
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate),
    };

    if (mode === "edit") {
      // Edit: PATCH invoice header only if it changed; line items are a separate update.
      // Baselines were captured after load so we can compute minimal deltas.

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

      // Header: compare current snapshot to baseline → partial InvoiceUpdate (or empty).
      const currentSnapshot = pickInvoicePatchSnapshot(updatedInvoice);
      const delta = computeInvoicePatchDelta(
        baselineInvoiceSnapshot,
        currentSnapshot
      );
      // Line items: normalize for API shape, then stable JSON string for equality with baseline.
      const normalizedLineItemsNow =
        lineItemsStore.normalizeLineItems(lineItems);
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

      // Order: PATCH header first (if needed), then line items, so line items always see final invoice id.
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
        if (lineResult === null) {
          return;
        }
      }
      await invoicesStore.loadItems(toNormalizedListQuery(undefined, {}));
      closePanel();
      return;
    }

    // --- Create: POST full invoice, then POST line items (nested resource) ---
    const invoiceId = await invoicesStore.createInvoice(updatedInvoice);
    if (!invoiceId) {
      toast.error("Failed to create invoice");
      return;
    }
    // --- Line items: normalize for API shape, then POST (nested resource) ---
    const normalizedLineItems = lineItemsStore.normalizeLineItems(lineItems);

    // POST line items only if there are any (empty array is valid for API).
    if (normalizedLineItems.length > 0) {
      await lineItemsStore.createLineItems(invoiceId, normalizedLineItems);
    }
    await invoicesStore.loadItems(toNormalizedListQuery(undefined, {}));
    closePanel();
  };

  const deleteModal = new ItemPanel<InvoiceDeleteConfirmItem>();
</script>

<form class="grid grid-cols-6 gap-x-2 md:gap-x-5" onsubmit={handleSubmit}>
  <!-- client -->

  <div class="field col-span-6 md:col-span-4">
    {#if !isNewClient}
      <label for="client">Client</label>
      <div class="flex flex-wrap items-end gap-x-2 sm:flex-nowrap md:gap-x-5">
        <select
          id="client"
          name="client"
          required={!isNewClient}
          bind:value={invoice.clientId}
          class="mbe-2 sm:mbe-0"
        >
          {#each clientsStore.clientPickerOptions as { id, name } (id)}
            <option value={id}>{name}</option>
          {/each}
        </select>
        <p class="text-monsoon text-base leading-9 font-bold lg:leading-14">
          or
        </p>
        <Button
          variant="outline"
          onclick={() => {
            isNewClient = true;
            newClient.name = "";
            newClient.email = "";
          }}>+ Client</Button
        >
      </div>
    {:else}
      <label for="newClient">New Client</label>
      <div class="flex flex-wrap items-end gap-x-2 sm:flex-nowrap md:gap-x-5">
        <input
          class="mbe-2 sm:mbe-0"
          bind:value={newClient.name}
          type="text"
          name="newClient"
          required={isNewClient}
        />
        <Button
          variant="outline"
          size="sm"
          onclick={() => {
            isNewClient = false;
            newClient = clientsStore.newClient();
          }}>Existing Client</Button
        >
      </div>
    {/if}
  </div>

  <!-- invoicenumber -->
  <div class="field -order-1 col-span-6 self-end sm:order-0 sm:col-span-2">
    <label for="invoiceNumber">InvoiceNumber</label>
    <input
      type="text"
      name="invoiceNumber"
      required
      bind:value={invoice.invoiceNumber}
    />
  </div>
  <!-- new client information -->
  {#if isNewClient}
    <div transition:slide class="field col-span-6 grid gap-x-5">
      <div class="field col-span-6">
        <label for="email">Client's Email</label>
        <input
          bind:value={newClient.email}
          required={isNewClient}
          type="email"
          name="email"
          id="email"
        />
      </div>

      <div class="field col-span-6">
        <label for="street">Street</label>
        <input
          bind:value={newClient.street}
          type="text"
          name="street"
          id="street"
        />
      </div>

      <div class="field col-span-2">
        <label for="city">City</label>
        <input bind:value={newClient.city} type="text" name="city" id="city" />
      </div>

      <div class="field col-span-2">
        <label for="state">State</label>
        <States bind:value={newClient.state} />
      </div>

      <div class="field col-span-2">
        <label for="zipCode">Zip Code</label>
        <input
          bind:value={newClient.zip}
          type="text"
          name="zipCode"
          id="zipCode"
        />
      </div>
    </div>
  {/if}

  <!-- duedate -->
  <div class="field col-span-3 sm:col-span-2">
    <label for="dueDate">Due Date</label>
    <input
      required
      type="date"
      name="dueDate"
      min={today}
      bind:value={invoice.dueDate}
    />
  </div>
  <!-- issue date -->
  <div class="field col-span-3 sm:col-span-2 md:col-start-5">
    <label for="issueDate">Issue Date</label>
    <input
      type="date"
      name="issueDate"
      min={today}
      bind:value={invoice.issueDate}
    />
  </div>
  <!-- subject -->
  <div class="field col-span-6">
    <label for="subject">Subject</label>
    <input type="text" name="subject" bind:value={invoice.subject} />
  </div>
  <!-- line items -->
  <div class="field col-span-6">
    {#if !lineItemsLoaded}
      <LineItemSkeleton />
    {:else}
      <LineItemRows
        {mode}
        {lineItems}
        discount={invoice.discount}
        {updateLineItem}
        {setDiscount}
        {addLineItem}
        {removeLineItem}
      />
    {/if}
  </div>

  <!-- notes -->
  <div class="field col-span-6">
    <label for="notes"
      >Notes <span class="font-normal">(optional, displayed on invoice)</span
      ></label
    >
    <textarea bind:value={invoice.notes} name="notes" id="notes"></textarea>
  </div>
  <!-- terms -->
  <div class="field col-span-6">
    <label for="terms"
      >Terms <span class="font-normal">(optional, displayed on invoice)</span
      ></label
    >
    <textarea bind:value={invoice.terms} name="terms" id="terms"></textarea>
    <p class="text-xs text-gray-400">
      Formatting tips: <strong>*bold*</strong>, <em>_italic_</em>
    </p>
  </div>
  <!-- buttons -->
  <div class="field col-span-2">
    <!-- delete button only visible if editing -->
    {#if mode === "edit"}
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
    {/if}
  </div>
  <div class="field col-span-4 flex justify-end gap-x-5">
    <Button variant="secondary" onclick={() => closePanel()}>Cancel</Button>
    <Button variant="default" type="submit">Save</Button>
  </div>
</form>

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
