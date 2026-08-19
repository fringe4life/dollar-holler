<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { grid, gridItem } from "#styled-system/patterns/index.js";
  import { slide } from "svelte/transition";
  import type {
    ClientInsert,
    ClientPickerOption,
  } from "#features/clients/types.ts";
  import { saveInvoice } from "#features/invoices/invoices.remote.ts";
  import LineItemRows from "#features/line-items/components/LineItemRows.svelte";
  import type {
    Key,
    LineItemEditRow,
    LineItemFormFieldAttrs,
    LineItemUpdate,
    NewLineItemWithId,
  } from "#features/line-items/types.ts";
  import FormField from "#lib/components/form/FormField.svelte";
  import States from "#lib/components/States.svelte";
  import Input from "#lib/components/ui/input/Input.svelte";
  import Textarea from "#lib/components/ui/textarea/Textarea.svelte";
  import type { BitsButton } from "#lib/types.ts";
  import { today } from "#lib/utils/dateHelpers.ts";
  import { zipInputAttrs } from "#lib/utils/zip.ts";
  import type { NewInvoice } from "../types";
  import {
    lineItemFormFieldValues,
    lineItemHiddenIdAttrs,
  } from "../utils/invoice-form-line-items";
  import ClientField from "./ClientField.svelte";

  interface InvoiceFormLayoutProps {
    addLineItem: BitsButton;
    clientOptions: ClientPickerOption[];
    invoice: NewInvoice;
    isNewClient: boolean;
    lineItems: Array<NewLineItemWithId | LineItemEditRow>;
    mode: "create" | "edit";
    newClient: ClientInsert;
  }

  let {
    invoice = $bindable(),
    lineItems = $bindable(),
    isNewClient = $bindable(),
    newClient = $bindable(),
    mode,
    addLineItem,
    clientOptions,
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

  const lineItemFieldAttrs = (index: number): LineItemFormFieldAttrs => {
    const row = saveInvoice.fields.lineItems[index];
    const values = lineItemFormFieldValues(lineItems[index]);
    return {
      amount: row.amount.as("number", values.amount),
      description: row.description.as("text", values.description),
      quantity: row.quantity.as("number", values.quantity),
      ...lineItemHiddenIdAttrs(values.persistedId, (id) =>
        row.id.as("hidden", id)
      ),
    };
  };
</script>

<div class={grid({ columns: 6, columnGap: { base: 2, md: 5 } })}>
  <ClientField {clientOptions} bind:invoice bind:isNewClient bind:newClient />

  <FormField
    class={gridItem({
      order: { base: -1, sm: 0 },
      colSpan: { base: 6, sm: 2 },
      alignSelf: "end",
    })}
    forId="invoiceNumber"
    issues={saveInvoice.fields.invoiceNumber.issues()}
    label="InvoiceNumber"
  >
    {#snippet children({ errorId })}
      <Input
        id="invoiceNumber"
        required
        type="text"
        aria-describedby={errorId}
        {...saveInvoice.fields.invoiceNumber.as("text", invoice.invoiceNumber)}
      />
    {/snippet}
  </FormField>

  {#if isNewClient}
    <div class={gridItem({ colSpan: 6, columnGap: 5 })} transition:slide>
      <FormField
        forId="email"
        issues={saveInvoice.fields.email.issues()}
        label="Client's Email"
      >
        {#snippet children({ errorId })}
          <Input
            id="email"
            required={isNewClient}
            aria-describedby={errorId}
            {...saveInvoice.fields.email.as("email", newClient.email)}
          />
        {/snippet}
      </FormField>

      <FormField
        forId="street"
        issues={saveInvoice.fields.street.issues()}
        label="Street"
      >
        {#snippet children({ errorId })}
          <Input
            id="street"
            type="text"
            aria-describedby={errorId}
            {...saveInvoice.fields.street.as("text", newClient.street)}
          />
        {/snippet}
      </FormField>

      <FormField
        class={gridItem({ colSpan: 2 })}
        forId="city"
        issues={saveInvoice.fields.city.issues()}
        label="City"
      >
        {#snippet children({ errorId })}
          <Input
            id="city"
            type="text"
            aria-describedby={errorId}
            {...saveInvoice.fields.city.as("text", newClient.city)}
          />
        {/snippet}
      </FormField>

      <FormField
        class={gridItem({ colSpan: 2 })}
        forId="state"
        issues={saveInvoice.fields.state.issues()}
        label="State"
      >
        {#snippet children({ errorId })}
          <States
            aria-describedby={errorId}
            {...saveInvoice.fields.state.as("text", newClient.state)}
          />
        {/snippet}
      </FormField>

      <FormField
        class={gridItem({ colSpan: 2 })}
        forId="zipCode"
        issues={saveInvoice.fields.zip.issues()}
        label="Zip Code"
      >
        {#snippet children({ errorId })}
          <Input
            id="zipCode"
            type="text"
            aria-describedby={errorId}
            {...zipInputAttrs}
            {...saveInvoice.fields.zip.as("text", newClient.zip)}
          />
        {/snippet}
      </FormField>
    </div>
  {/if}

  <FormField
    class={gridItem({ colSpan: { base: 6, md: 2 } })}
    forId="dueDate"
    issues={saveInvoice.fields.dueDate.issues()}
    label="Due Date"
  >
    {#snippet children({ errorId })}
      <Input
        id="dueDate"
        min={today}
        required
        aria-describedby={errorId}
        {...saveInvoice.fields.dueDate.as("date", invoice.dueDate)}
      />
    {/snippet}
  </FormField>

  <FormField
    class={gridItem({
      colSpan: { base: 6, md: 2 },
      colStart: { md: 5 },
      colEnd: { md: 7 },
    })}
    forId="issueDate"
    issues={saveInvoice.fields.issueDate.issues()}
    label="Issue Date"
  >
    {#snippet children({ errorId })}
      <Input
        id="issueDate"
        min={today}
        aria-describedby={errorId}
        {...saveInvoice.fields.issueDate.as("date", invoice.issueDate)}
      />
    {/snippet}
  </FormField>

  <FormField
    class={gridItem({ colSpan: 6 })}
    forId="subject"
    issues={saveInvoice.fields.subject.issues()}
    label="Subject"
  >
    {#snippet children({ errorId })}
      <Input
        id="subject"
        type="text"
        aria-describedby={errorId}
        {...saveInvoice.fields.subject.as("text", invoice.subject)}
      />
    {/snippet}
  </FormField>

  <FormField
    class={gridItem({ colSpan: 6 })}
    issues={saveInvoice.fields.lineItems.allIssues()}
  >
    <LineItemRows
      {addLineItem}
      discount={invoice.discount}
      discountAttrs={saveInvoice.fields.discount.as("number", invoice.discount)}
      {lineItemFieldAttrs}
      {lineItems}
      {mode}
      {removeLineItem}
      {setDiscount}
      {updateLineItem}
    />
  </FormField>

  <FormField
    class={gridItem({ colSpan: 6 })}
    forId="notes"
    issues={saveInvoice.fields.notes.issues()}
    label="Notes"
  >
    {#snippet children({ errorId })}
      <Textarea
        id="notes"
        aria-describedby={errorId}
        {...saveInvoice.fields.notes.as("text", invoice.notes ?? "")}
      ></Textarea>
    {/snippet}
    {#snippet hint()}
      <span class={css({ fontWeight: "normal" })}
        >(optional, displayed on invoice)</span
      >
    {/snippet}
  </FormField>

  <FormField
    class={gridItem({ colSpan: 6 })}
    forId="terms"
    issues={saveInvoice.fields.terms.issues()}
    label="Terms"
  >
    {#snippet children({ errorId })}
      <Textarea
        id="terms"
        aria-describedby={errorId}
        {...saveInvoice.fields.terms.as("text", invoice.terms ?? "")}
      ></Textarea>
    {/snippet}
    {#snippet hint()}
      <p class={css({ fontSize: "xs", color: "gray.400" })}>
        Formatting tips: <strong>*bold*</strong>, <em>_italic_</em>
      </p>
    {/snippet}
  </FormField>
</div>
