<script lang="ts">
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import Trash from "$lib/components/icons/Trash.svelte";
  import States from "$lib/components/States.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { LineItem, NewClient, NewInvoice } from "$lib/db/schema";
  import type {
    InvoiceFormProps,
    Key,
    LineItemUpdate,
    NewLineItemWithId,
  } from "$lib/features/line-items/types";
  import { toNormalizedListQuery } from "$lib/features/pagination/utils/list-query";
  import { Counter } from "$lib/runes/Counter.svelte";
  import { ItemPanel } from "$lib/runes/ItemPanel.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { BitsButton, CursorId } from "$lib/types";
  import { toDateInputValue, today } from "$lib/utils/dateHelpers";
  import { formatTotal, sumLineItems } from "$lib/utils/moneyHelpers";
  import { onDestroy, onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import type { FormEventHandler } from "svelte/elements";
  import { slide } from "svelte/transition";
  import LineItemRows from "../../line-items/components/LineItemRows.svelte";
  import LineItemSkeleton from "../../line-items/components/LineItemSkeleton.svelte";
  import type { InvoiceInsert, InvoiceListResponse } from "../types";

  let {
    mode = "create",
    closePanel,
    invoiceEdit = $bindable(),
    userId = null,
  }: InvoiceFormProps = $props();

  const {
    clients: clientsStore,
    invoices: invoicesStore,
    lineItems: lineItemsStore,
  } = getDashboardStores();

  // Form data using NewInvoice type
  let invoice: Omit<InvoiceInsert, "clientId"> & {
    clientId: CursorId | undefined;
  } = $state(invoicesStore.newInvoice());

  const counter = new Counter();

  let lineItems: Array<NewLineItemWithId | LineItem> = $state([
    lineItemsStore.newLineItem({
      id: counter.increment(),
      invoiceId: invoice.id,
    }),
  ]);
  let lineItemsLoaded = $state(true);
  let discount = $state<number>(0);

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
      invoice = { ...invoiceEdit, issueDate, dueDate } as unknown as NewInvoice;
      discount = invoiceEdit.discount ?? 0;

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
              invoiceId: invoice.id,
            }),
          ];
        }
        lineItemsLoaded = true;
      }
    }
  });

  onDestroy(() => {
    isMounted = false;
    abortController?.abort();
    // TODO: delete the counter to free up memory
    counter.reset();
  });

  const addLineItem: BitsButton = () => {
    lineItems = [
      ...lineItems,
      lineItemsStore.newLineItem({
        id: counter.increment(),
        invoiceId: invoice.id,
      }),
    ];
  };

  const removeLineItem = (id: Key) => {
    lineItems = lineItems.filter((lineItem) => lineItem.id !== id);
  };

  const updateLineItem = (id: Key, patch: LineItemUpdate) => {
    lineItems = lineItemsStore.patchLineItem(lineItems, id, patch);
  };

  const setDiscount = (value: number) => {
    discount = value;
  };

  let isNewClient = $state<boolean>(false);

  let newClient: NewClient = $state(clientsStore.newClient());

  const clientName = $derived(
    clientsStore.clientPickerOptions.find((c) => c.id === invoice.clientId)
      ?.name ?? "Unknown"
  );
  const totalDisplay = $derived(formatTotal(sumLineItems(lineItems), discount));

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    // check if the client is new and create it
    if (isNewClient) {
      const clientId = await clientsStore.upsertClient(newClient);
      if (!clientId) {
        toast.error("Failed to create client");
        return;
      }
      invoice.clientId = clientId;
    }
    // make sure there is a clientId
    if (!invoice.clientId) {
      toast.error("Client is required");
      return;
    }

    const resolvedUserId = userId ?? invoice.userId;
    if (!resolvedUserId) {
      toast.error("User not available");
      return;
    }

    invoice.userId = resolvedUserId;
    newClient.userId = resolvedUserId;

    // this as assertion relies on the check above to ensure the clientId is set
    const normalizedInvoice: NewInvoice = invoicesStore.normalizeInvoice(
      invoice as NewInvoice,
      discount,
      resolvedUserId
    );
    // upsert the invoice
    const invoiceId = await invoicesStore.upsertInvoice(normalizedInvoice);
    if (!invoiceId) {
      toast.error("Failed to create invoice");
      return;
    }

    const normalizedLineItems = lineItemsStore.normalizeLineItems(
      lineItems,
      resolvedUserId,
      invoiceId
    );

    if (normalizedLineItems.length > 0) {
      if (mode === "edit") {
        await lineItemsStore.updateLineItems(invoiceId, normalizedLineItems);
      } else {
        await lineItemsStore.createLineItems(invoiceId, normalizedLineItems);
      }
    }
    await invoicesStore.loadItems(toNormalizedListQuery(undefined, {}));
    closePanel();
  };

  type InvoiceDeleteConfirmItem = Pick<
    InvoiceListResponse,
    "id" | "client" | "total"
  >;
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
            newClient.email = null;
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
        {discount}
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
            client: { name: clientName },
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
        >{inv.client.name}</span
      >
      for
      <span class="text-scarlet">{totalDisplay}</span>
    {/snippet}
  </ConfirmDelete>
{/if}
