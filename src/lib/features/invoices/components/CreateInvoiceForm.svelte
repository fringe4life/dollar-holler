<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import type { FormEventHandler } from "svelte/elements";
  import type { ClientInsert } from "$features/clients/types";
  import type {
    LineItemEditRow,
    NewLineItemWithId,
  } from "$features/line-items/types";
  import { toNormalizedListQuery } from "$features/pagination/utils/list-query";
  import { Counter } from "$lib/client/runes/Counter.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { BitsButton, CursorId, Maybe } from "$lib/types";
  import { isAbortError } from "$lib/utils/error-message";
  import { toast } from "$lib/utils/toast.svelte";
  import type { NewInvoice } from "../types";
  import InvoiceFormLayout from "./InvoiceFormLayout.svelte";

  let { closePanel }: { closePanel: () => void } = $props();

  const {
    clients: clientsStore,
    invoices: invoicesStore,
    lineItems: lineItemsStore,
  } = getDashboardStores();

  let invoice: NewInvoice = $state(invoicesStore.newInvoice());

  const counter = new Counter();

  let lineItems: Array<NewLineItemWithId | LineItemEditRow> = $state([
    lineItemsStore.newLineItem(counter.increment()),
  ]);

  let isNewClient = $state(false);
  let newClient: ClientInsert = $state(clientsStore.newClient());

  let abortController: AbortController | null = null;

  onMount(async () => {
    abortController = new AbortController();
    try {
      await clientsStore.loadClientPickerOptions(abortController.signal);
    } catch (err) {
      if (!isAbortError(err)) {
        toast.error("Failed to load clients");
      }
    }
  });

  onDestroy(() => {
    abortController?.abort();
    counter.reset();
  });

  const addLineItem: BitsButton = () => {
    lineItems.push(lineItemsStore.newLineItem(counter.increment()));
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    let clientId: Maybe<CursorId> = null;
    if (isNewClient) {
      clientId = await clientsStore.createClient(newClient);
      if (!clientId) {
        toast.error("Failed to create client");
        return;
      }
    } else {
      clientId = invoice.clientId ?? null;
    }

    if (!clientId) {
      toast.error("Client is required");
      return;
    }

    const invoiceData = {
      ...invoice,
      clientId,
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate),
    };

    const invoiceId = await invoicesStore.createInvoice(invoiceData);
    if (!invoiceId) {
      toast.error("Failed to create invoice");
      return;
    }

    const normalizedLineItems = lineItemsStore.normalizeLineItems(lineItems);
    if (normalizedLineItems.length > 0) {
      await lineItemsStore.createLineItems(invoiceId, normalizedLineItems);
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
  lineItemsLoaded={true}
  mode="create"
  {closePanel}
  {addLineItem}
/>
