<script lang="ts">
  import { onDestroy } from "svelte";
  import type { FormEventHandler } from "svelte/elements";
  import {
    clientPickerOptions,
    createClient,
  } from "#features/clients/clients.remote.ts";
  import type { ClientInsert } from "#features/clients/types.ts";
  import { newClient } from "#features/clients/utils/new-client.ts";
  import {
    createInvoice,
    listInvoices,
  } from "#features/invoices/invoices.remote.ts";
  import { createLineItems } from "#features/line-items/line-items.remote.ts";
  import type {
    LineItemEditRow,
    NewLineItemWithId,
  } from "#features/line-items/types.ts";
  import {
    newLineItem,
    normalizeLineItems,
  } from "#features/line-items/utils/line-item-form.ts";
  import { toNormalizedListQuery } from "#features/pagination/utils/list-query.ts";
  import { Counter } from "#lib/client/runes/Counter.svelte.ts";
  import type { BitsButton } from "#lib/types.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";
  import { toast } from "#lib/utils/toast.svelte.ts";
  import { newInvoice } from "../utils/new-invoice";
  import { resolveClientId } from "../utils/resolve-client-id";
  import InvoiceFormLayout from "./InvoiceFormLayout.svelte";

  let { closePanel }: { closePanel: () => void } = $props();

  const picker = $derived(await clientPickerOptions());

  let invoice = $state(newInvoice());

  const counter = new Counter();

  let lineItems: Array<NewLineItemWithId | LineItemEditRow> = $state([
    newLineItem(counter.increment()),
  ]);

  let isNewClient = $state(false);
  let newClientState: ClientInsert = $state(newClient());

  onDestroy(() => {
    counter.reset();
  });

  const addLineItem: BitsButton = () => {
    lineItems.push(newLineItem(counter.increment()));
  };

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

      const invoiceData = {
        ...invoice,
        clientId: client.clientId,
        dueDate: new Date(invoice.dueDate),
        issueDate: new Date(invoice.issueDate),
      };

      const { id: invoiceId } = await createInvoice(invoiceData);

      const normalized = normalizeLineItems(lineItems);
      if (normalized.length > 0) {
        await createLineItems({ invoiceId, lineItems: normalized });
      }

      await listInvoices(toNormalizedListQuery(undefined, {})).refresh();
      closePanel();
      toast.success("Invoice created successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to create invoice"));
    }
  };
</script>

<InvoiceFormLayout
  {addLineItem}
  clientOptions={picker.options}
  {closePanel}
  lineItemsLoaded={true}
  mode="create"
  onsubmit={handleSubmit}
  bind:invoice
  bind:isNewClient
  bind:lineItems
  bind:newClient={newClientState}
/>
