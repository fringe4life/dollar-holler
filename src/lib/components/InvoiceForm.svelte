<script lang="ts">
  import type { LineItem, NewClient, NewInvoice } from "$lib/db/schema";
  import Trash from "$lib/icon/Trash.svelte";
  import { clients, clientsStore } from "$lib/stores/clientsStore.svelte";
  import { invoicesStore } from "$lib/stores/invoicesStore.svelte";
  import { lineItemsStore } from "$lib/stores/lineItemsStore.svelte";
  import type { BitsButton, Maybe } from "$lib/types";
  import { today } from "$lib/utils/dateHelpers";
  import { formatTotal, sumLineItems } from "$lib/utils/moneyHelpers";
  import type { InvoiceSelect } from "$lib/validators";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import type { FormEventHandler } from "svelte/elements";
  import { slide } from "svelte/transition";
  import ConfirmDelete from "../../routes/(dashboard)/invoices/ConfirmDelete.svelte";
  import LineItemRows from "../../routes/(dashboard)/invoices/LineItemRows.svelte";
  import States from "./States.svelte";
  import Button from "./ui/button/button.svelte";

  type Panel = {
    closePanel: () => void;
  };

  type EditProps = {
    invoiceEdit: InvoiceSelect;
    formState: "edit";
  } & Panel;

  type CreateProps = {
    formState: "create";
    invoiceEdit: undefined;
  } & Panel;

  type Props = (CreateProps | EditProps) & {
    userId?: Maybe<string>;
  };

  let {
    formState = "create",
    closePanel,
    invoiceEdit = $bindable(),
    userId = null,
  }: Props = $props();

  onMount(() => {
    clientsStore.loadClients();
  });

  // Form data using NewInvoice type
  let invoice: NewInvoice = $state(invoicesStore.newInvoice());

  let lineItems: LineItem[] = $state([lineItemsStore.newLineItem()]);
  let lineItemsLoaded = $state(true);
  let loadToken = 0;

  // svelte-ignore state_referenced_locally
  let discount = $state<number>(invoice.discount ?? 0);

  $effect(() => {
    const isEdit = formState === "edit";
    const editId = invoiceEdit?.id;
    if (isEdit && editId) {
      lineItemsLoaded = false;
      const token = ++loadToken;
      lineItemsStore
        .loadLineItemsByInvoiceId(editId)
        .then((items) => {
          if (token !== loadToken) return;
          if (items) {
            lineItems = items;
          } else {
            lineItems = [lineItemsStore.newLineItem()];
          }
          lineItemsLoaded = true;
        })
        .catch((_) => {
          lineItems = [lineItemsStore.newLineItem()];
        })
        .finally(() => {
          lineItemsLoaded = true;
        });
      return () => {
        loadToken++;
      };
    } else {
      lineItems = [lineItemsStore.newLineItem()];
      lineItemsLoaded = true;
    }
  });

  $effect(() => {
    if (formState === "edit" && invoiceEdit) {
      invoice = { ...invoiceEdit };
      discount = invoiceEdit.discount ?? 0;
    }
  });

  const addLineItem: BitsButton = () => {
    lineItems = [...lineItems, lineItemsStore.newLineItem()];
  };

  const removeLineItem = (id: string) => {
    lineItems = lineItems.filter((lineItem) => lineItem.id !== id);
  };

  let isNewClient = $state<boolean>(false);

  let newClient: NewClient = $state(clientsStore.newClient());

  const clientName = $derived(
    clients.find((c) => c.id === invoice.clientId)?.name ?? "Unknown"
  );
  const totalDisplay = $derived(formatTotal(sumLineItems(lineItems), discount));

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    console.log("[InvoiceForm] submit start", {
      formState,
      userId,
      invoice: $state.snapshot(invoice),
      lineItems: $state.snapshot(lineItems),
      isNewClient,
      newClient: $state.snapshot(newClient),
    });

    if (!invoice.clientId) {
      console.warn("[InvoiceForm] missing clientId", {
        invoice: $state.snapshot(invoice),
      });
      toast.error("Client is required");
      return;
    }

    const resolvedUserId = userId ?? invoice.userId;
    if (!resolvedUserId) {
      console.warn("[InvoiceForm] missing userId", {
        invoice: $state.snapshot(invoice),
      });
      toast.error("User not available");
      return;
    }

    invoice.userId = resolvedUserId;
    newClient.userId = resolvedUserId;

    if (isNewClient) {
      console.log("[InvoiceForm] creating new client", {
        newClient: $state.snapshot(newClient),
      });
      const clientId = await clientsStore.upsertClient(newClient);
      if (!clientId) {
        console.error("[InvoiceForm] client create failed", {
          newClient: $state.snapshot(newClient),
        });
        toast.error("Failed to create client");
        return;
      }
      invoice.clientId = clientId;
    }

    // Sync discount back to invoice before saving
    invoice.discount = discount;

    // Single upsert call - much simpler!
    const normalizedInvoice = {
      ...invoice,
      userId: resolvedUserId,
      invoiceNumber: String(invoice.invoiceNumber ?? ""),
      issueDate: new Date(invoice.issueDate),
      dueDate: new Date(invoice.dueDate),
    };
    console.log("[InvoiceForm] upsert invoice", normalizedInvoice);
    const invoiceId = await invoicesStore.upsertInvoice(normalizedInvoice);
    if (!invoiceId) {
      return;
    }

    const normalizedLineItems = $state
      .snapshot(lineItems)
      .map((item) => ({
        id: item.id,
        userId: resolvedUserId,
        invoiceId,
        description: item.description?.trim() ?? "",
        quantity: Number(item.quantity ?? 0),
        amount: Number(item.amount ?? 0),
      }))
      .filter((item) => item.description.length > 0);

    if (normalizedLineItems.length > 0) {
      if (formState === "edit") {
        await lineItemsStore.updateLineItems(invoiceId, normalizedLineItems);
      } else {
        await lineItemsStore.createLineItems(invoiceId, normalizedLineItems);
      }
    }
    await invoicesStore.loadInvoices();
    console.log("[InvoiceForm] upsert success");
    closePanel();
  };

  let open = $state<boolean>(false);
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
          class="mb-2 sm:mb-0"
        >
          {#each clients as { id, name } (id)}
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
          class="mb-2 sm:mb-0"
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
            newClient = {
              clientStatus: "active",
              city: null,
              email: null,
              name: "",
              state: null,
              street: null,
              zip: null,
              userId: "",
            };
          }}>Existing Client</Button
        >
      </div>
    {/if}
  </div>

  <!-- invoiceid -->
  <div class="field -order-1 col-span-6 self-end sm:order-0 sm:col-span-2">
    <label for="invoiceNumber">InvoiceNumber</label>
    <input
      type="number"
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
      <div class="space-y-4">
        <div class="flex justify-between border-b-2 pb-2">
          <div class="h-4 w-24 rounded bg-gray-200"></div>
          <div class="h-4 w-16 rounded bg-gray-200"></div>
          <div class="h-4 w-12 rounded bg-gray-200"></div>
          <div class="h-4 w-16 rounded bg-gray-200"></div>
        </div>
        <div class="h-10 w-full rounded bg-gray-100 animate-pulse"></div>
        <div class="h-10 w-full rounded bg-gray-100 animate-pulse"></div>
      </div>
    {:else}
      <LineItemRows
        bind:discount
        bind:lineItems
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
    {#if formState === "edit"}
      <Button variant="textOnlyDestructive" onclick={() => (open = true)}
        ><Trash />Delete</Button
      >
    {/if}
  </div>
  <div class="field col-span-4 flex justify-end gap-x-5">
    <Button variant="secondary" onclick={() => closePanel()}>Cancel</Button>
    <Button variant="default" type="submit">Save</Button>
  </div>
</form>

<ConfirmDelete
  bind:open
  invoiceId={invoice.id ?? ""}
  {clientName}
  {totalDisplay}
/>
