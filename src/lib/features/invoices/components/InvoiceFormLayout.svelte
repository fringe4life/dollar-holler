<script lang="ts">
  import { css } from "styled-system/css";
  import { grid, gridItem } from "styled-system/patterns";
  import type { Snippet } from "svelte";
  import type { FormEventHandler } from "svelte/elements";
  import { slide } from "svelte/transition";
  import type { ClientInsert } from "$features/clients/types";
  import LineItemRows from "$features/line-items/components/LineItemRows.svelte";
  import LineItemSkeleton from "$features/line-items/components/LineItemSkeleton.svelte";
  import type {
    Key,
    LineItemEditRow,
    LineItemUpdate,
    NewLineItemWithId,
  } from "$features/line-items/types";
  import FormField from "$lib/components/FormField.svelte";
  import States from "$lib/components/States.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
  import Label from "$lib/components/ui/label/Label.svelte";
  import Textarea from "$lib/components/ui/textarea/Textarea.svelte";
  import type { BitsButton } from "$lib/types";
  import { today } from "$lib/utils/dateHelpers";
  import type { NewInvoice } from "../types";
  import ClientField from "./ClientField.svelte";

  interface InvoiceFormLayoutProps {
    addLineItem: BitsButton;
    buttons?: Snippet;
    closePanel: () => void;
    invoice: NewInvoice;
    isNewClient: boolean;
    lineItems: Array<NewLineItemWithId | LineItemEditRow>;
    lineItemsLoaded: boolean;
    mode: "create" | "edit";
    newClient: ClientInsert;
    onsubmit: FormEventHandler<HTMLFormElement>;
  }

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
  }: InvoiceFormLayoutProps = $props();

  const removeLineItem = (id: Key) => {
    const index = lineItems.findIndex((item) => item.id === id);
    if (index !== -1) {
      lineItems.splice(index, 1);
    }
  };

  const updateLineItem = (id: Key, patch: LineItemUpdate) => {
    const index = lineItems.findIndex((item) => item.id === id);
    if (index !== -1) {
      lineItems[index] = { ...lineItems[index], ...patch };
    }
  };

  const setDiscount = (value: number) => {
    invoice = { ...invoice, discount: value };
  };
</script>

<!-- "grid grid-cols-6 gap-x-2 md:gap-x-5" -->
<form class={grid({ columns: 6, columnGap: { base: 2, md: 5 } })} {onsubmit}>
  <!-- client -->
  <ClientField bind:invoice bind:isNewClient bind:newClient />

  <!-- invoice number -->
  <!-- "field -order-1 col-span-6 self-end sm:order-0 sm:col-span-2" -->
  <FormField
    label="InvoiceNumber"
    forId="invoiceNumber"
    class={gridItem({
      order: { base: -1, sm: 0 },
      colSpan: { base: 6, sm: 2 },
      alignSelf: "end",
    })}
  >
    <Input
      type="text"
      name="invoiceNumber"
      id="invoiceNumber"
      required
      bind:value={invoice.invoiceNumber}
    />
  </FormField>

  <!-- new client extended fields -->
  {#if isNewClient}
    <div transition:slide class={gridItem({ colSpan: 6, columnGap: 5 })}>
      <FormField label="Client's Email" forId="email">
        <Input
          bind:value={newClient.email}
          required={isNewClient}
          type="email"
          name="email"
          id="email"
        />
      </FormField>

      <FormField label="Street" forId="street">
        <Input
          bind:value={newClient.street}
          type="text"
          name="street"
          id="street"
        />
      </FormField>

      <FormField label="City" forId="city" class={gridItem({ colSpan: 2 })}>
        <Input bind:value={newClient.city} type="text" name="city" id="city" />
      </FormField>

      <FormField label="State" forId="state" class={gridItem({ colSpan: 2 })}>
        <States bind:value={newClient.state} />
      </FormField>

      <FormField
        label="Zip Code"
        forId="zipCode"
        class={gridItem({ colSpan: 2 })}
      >
        <Input
          bind:value={newClient.zip}
          type="text"
          name="zipCode"
          id="zipCode"
        />
      </FormField>
    </div>
  {/if}

  <!-- due date -->
  <FormField
    label="Due Date"
    forId="dueDate"
    class={gridItem({ colSpan: { base: 3, sm: 2 } })}
  >
    <Input
      required
      type="date"
      name="dueDate"
      id="dueDate"
      min={today}
      bind:value={invoice.dueDate}
    />
  </FormField>

  <!-- issue date -->
  <!-- "field col-span-3 sm:col-span-2 md:col-start-5" -->
  <FormField
    label="Issue Date"
    forId="issueDate"
    class={gridItem({ colSpan: { base: 3, sm: 2 }, colStart: { sm: 5 }, colEnd: { sm: 7 } })}
  >
    <Input
      type="date"
      name="issueDate"
      id="issueDate"
      min={today}
      bind:value={invoice.issueDate}
    />
  </FormField>

  <!-- subject -->
  <FormField label="Subject" forId="subject" class={gridItem({ colSpan: 6 })}>
    <Input
      type="text"
      name="subject"
      id="subject"
      bind:value={invoice.subject}
    />
  </FormField>

  <!-- line items -->
  <FormField class={gridItem({ colSpan: 6 })}>
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
  </FormField>

  <!-- notes -->
  <FormField class={gridItem({ colSpan: 6 })}>
    <Label for="notes"
      >Notes
      <span class={css({ fontWeight: "normal" })}
        >(optional, displayed on invoice)</span
      ></Label
    >
    <Textarea bind:value={invoice.notes} name="notes" id="notes"></Textarea>
  </FormField>

  <!-- terms -->
  <FormField class={gridItem({ colSpan: 6 })}>
    <Label for="terms"
      >Terms
      <span class={css({ fontWeight: "normal" })}
        >(optional, displayed on invoice)</span
      ></Label
    >
    <Textarea bind:value={invoice.terms} name="terms" id="terms"></Textarea>
    <p class={css({ fontSize: "xs", color: "gray.400" })}>
      Formatting tips: <strong>*bold*</strong>, <em>_italic_</em>
    </p>
  </FormField>

  <!-- buttons -->
  <FormField class={gridItem({ colSpan: 2 })}>{@render buttons?.()}</FormField>
  <FormField class={gridItem({ colSpan: 4, justifySelf: "end", columnGap: 5 })}>
    <Button variant="secondary" onclick={() => closePanel()}>Cancel</Button>
    <Button variant="default" type="submit">Save</Button>
  </FormField>
</form>
