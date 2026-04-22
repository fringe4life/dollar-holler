<script lang="ts">
  import type { ClientInsert } from "$features/clients/types";
  import LineItemRows from "$features/line-items/components/LineItemRows.svelte";
  import LineItemSkeleton from "$features/line-items/components/LineItemSkeleton.svelte";
  import type {
    Key,
    LineItemEditRow,
    LineItemUpdate,
    NewLineItemWithId,
  } from "$features/line-items/types";
  import States from "$lib/components/States.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import type { BitsButton } from "$lib/types";
  import { today } from "$lib/utils/dateHelpers";
  import type { Snippet } from "svelte";
  import type { FormEventHandler } from "svelte/elements";
  import { slide } from "svelte/transition";
  import type { NewInvoice } from "../types";
  import ClientField from "./ClientField.svelte";

  let {
    onsubmit,
    invoice = $bindable(),
    lineItems = $bindable(),
    isNewClient = $bindable(),
    newClient = $bindable(),
    lineItemsLoaded,
    mode,
    closePanel,
    addLineItem,
    buttons,
  }: {
    onsubmit: FormEventHandler<HTMLFormElement>;
    invoice: NewInvoice;
    lineItems: Array<NewLineItemWithId | LineItemEditRow>;
    isNewClient: boolean;
    newClient: ClientInsert;
    lineItemsLoaded: boolean;
    mode: "create" | "edit";
    closePanel: () => void;
    addLineItem: BitsButton;
    buttons?: Snippet;
  } = $props();

  const removeLineItem = (id: Key) => {
    const index = lineItems.findIndex((item) => item.id === id);
    if (index !== -1) lineItems.splice(index, 1);
  };

  const updateLineItem = (id: Key, patch: LineItemUpdate) => {
    const index = lineItems.findIndex((item) => item.id === id);
    if (index !== -1) lineItems[index] = { ...lineItems[index], ...patch };
  };

  const setDiscount = (value: number) => {
    invoice = { ...invoice, discount: value };
  };
</script>

<form class="grid grid-cols-6 gap-x-2 md:gap-x-5" {onsubmit}>
  <!-- client -->
  <ClientField bind:invoice bind:isNewClient bind:newClient />

  <!-- invoice number -->
  <div class="field -order-1 col-span-6 self-end sm:order-0 sm:col-span-2">
    <label for="invoiceNumber">InvoiceNumber</label>
    <input
      type="text"
      name="invoiceNumber"
      required
      bind:value={invoice.invoiceNumber}
    />
  </div>

  <!-- new client extended fields -->
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

  <!-- due date -->
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
    {@render buttons?.()}
  </div>
  <div class="field col-span-4 flex justify-end gap-x-5">
    <Button variant="secondary" onclick={() => closePanel()}>Cancel</Button>
    <Button variant="default" type="submit">Save</Button>
  </div>
</form>
