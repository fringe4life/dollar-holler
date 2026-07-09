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

<form class={grid({ columns: 6, columnGap: { base: 2, md: 5 } })} {onsubmit}>
  <!-- client -->
  <ClientField bind:invoice bind:isNewClient bind:newClient />

  <!-- invoice number -->
  <FormField
    class={gridItem({
      order: { base: -1, sm: 0 },
      colSpan: { base: 6, sm: 2 },
      alignSelf: "end",
    })}
    forId="invoiceNumber"
    label="InvoiceNumber"
  >
    <Input
      id="invoiceNumber"
      name="invoiceNumber"
      required
      type="text"
      bind:value={invoice.invoiceNumber}
    />
  </FormField>

  <!-- new client extended fields -->
  {#if isNewClient}
    <div class={gridItem({ colSpan: 6, columnGap: 5 })} transition:slide>
      <FormField forId="email" label="Client's Email">
        <Input
          id="email"
          name="email"
          required={isNewClient}
          type="email"
          bind:value={newClient.email}
        />
      </FormField>

      <FormField forId="street" label="Street">
        <Input
          id="street"
          name="street"
          type="text"
          bind:value={newClient.street}
        />
      </FormField>

      <FormField class={gridItem({ colSpan: 2 })} forId="city" label="City">
        <Input id="city" name="city" type="text" bind:value={newClient.city} />
      </FormField>

      <FormField class={gridItem({ colSpan: 2 })} forId="state" label="State">
        <States bind:value={newClient.state} />
      </FormField>

      <FormField
        class={gridItem({ colSpan: 2 })}
        forId="zipCode"
        label="Zip Code"
      >
        <Input
          id="zipCode"
          name="zipCode"
          type="text"
          bind:value={newClient.zip}
        />
      </FormField>
    </div>
  {/if}

  <!-- due date -->
  <FormField
    class={gridItem({ colSpan: { base: 3, sm: 2 } })}
    forId="dueDate"
    label="Due Date"
  >
    <Input
      id="dueDate"
      min={today}
      name="dueDate"
      required
      type="date"
      bind:value={invoice.dueDate}
    />
  </FormField>

  <!-- issue date -->
  <FormField
    class={gridItem({
      colSpan: { base: 3, sm: 2 },
      colStart: { sm: 5 },
      colEnd: { sm: 7 },
    })}
    forId="issueDate"
    label="Issue Date"
  >
    <Input
      id="issueDate"
      min={today}
      name="issueDate"
      type="date"
      bind:value={invoice.issueDate}
    />
  </FormField>

  <!-- subject -->
  <FormField class={gridItem({ colSpan: 6 })} forId="subject" label="Subject">
    <Input
      id="subject"
      name="subject"
      type="text"
      bind:value={invoice.subject}
    />
  </FormField>

  <!-- line items -->
  <FormField class={gridItem({ colSpan: 6 })}>
    {#if !lineItemsLoaded}
      <LineItemSkeleton />
    {:else}
      <LineItemRows
        {addLineItem}
        discount={invoice.discount}
        {lineItems}
        {mode}
        {removeLineItem}
        {setDiscount}
        {updateLineItem}
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
    <Textarea id="notes" name="notes" bind:value={invoice.notes}></Textarea>
  </FormField>

  <!-- terms -->
  <FormField class={gridItem({ colSpan: 6 })}>
    <Label for="terms"
      >Terms
      <span class={css({ fontWeight: "normal" })}
        >(optional, displayed on invoice)</span
      ></Label
    >
    <Textarea id="terms" name="terms" bind:value={invoice.terms}></Textarea>
    <p class={css({ fontSize: "xs", color: "gray.400" })}>
      Formatting tips: <strong>*bold*</strong>, <em>_italic_</em>
    </p>
  </FormField>

  <!-- buttons -->
  <FormField class={gridItem({ colSpan: 2 })}>{@render buttons?.()}</FormField>
  <FormField class={gridItem({ colSpan: 4, justifySelf: "end", columnGap: 5 })}>
    <Button onclick={closePanel} variant="secondary">Cancel</Button>
    <Button type="submit" variant="default">Save</Button>
  </FormField>
</form>
