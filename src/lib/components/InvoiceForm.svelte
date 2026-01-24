<script lang="ts">
  import type {
    Invoice,
    LineItem,
    NewClient,
    NewInvoice,
  } from "$lib/db/schema";
  import Trash from "$lib/icon/Trash.svelte";
  import { clientsStore } from "$lib/stores/clientsStore.svelte";
  import { invoicesStore } from "$lib/stores/invoicesStore.svelte";
  import { today } from "$lib/utils/dateHelpers";
  import { states } from "$lib/utils/states";
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import type { FormEventHandler, MouseEventHandler } from "svelte/elements";
  import { slide } from "svelte/transition";
  import ConfirmDelete from "../../routes/(dashboard)/invoices/ConfirmDelete.svelte";
  import LineItemRows from "../../routes/(dashboard)/invoices/LineItemRows.svelte";
  import Button from "./ui/button/button.svelte";

  type Panel = {
    closePanel: () => void;
  };

  type EditProps = {
    invoiceEdit: Invoice;
    formState: "edit";
  } & Panel;

  type CreateProps = {
    formState: "create";
    invoiceEdit: undefined;
  } & Panel;

  type Props = CreateProps | EditProps;

  let {
    formState = "create",
    closePanel,
    invoiceEdit = $bindable(),
  }: Props = $props();

  onMount(() => {
    clientsStore.loadClients();
  });

  // Form data using NewInvoice type
  let invoice: NewInvoice = $state({
    clientId: "",
    invoiceNumber: "",
    subject: null,
    issueDate: new Date(),
    dueDate: new Date(),
    discount: null,
    notes: null,
    terms: null,
    invoiceStatus: "draft",
    userId: "", // This will be set from the session
  });

  // Separate state for line items (not part of NewInvoice)
  let lineItems: LineItem[] = $state([
    {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: "",
      description: "",
      invoiceId: "",
      quantity: 0,
      amount: 0,
    },
  ]);

  // Initialize form data based on edit mode (one-time, on mount)
  // svelte-ignore state_referenced_locally
  if (formState === "edit" && invoiceEdit) {
    // Extract only the fields we need for the form
    invoice = invoiceEdit;
    // Line items will be handled separately
  }

  const addLineItem: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = () => {
    lineItems = [
      ...lineItems,
      {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "",
        description: "",
        invoiceId: "",
        quantity: 0,
        amount: 0,
      },
    ];
  };

  const removeLineItem = (id: string) => {
    lineItems = lineItems.filter((lineItem) => lineItem.id !== id);
  };

  let isNewClient = $state<boolean>(false);

  let newClient: NewClient = $state({
    clientStatus: "active",
    city: null,
    email: null,
    name: "",
    state: null,
    street: null,
    zip: null,
    userId: "", // This will be set from the session
  });

  // Use $state for discount - syncs bidirectionally with invoice.discount
  // svelte-ignore state_referenced_locally
  let discount = $state<number>(invoice.discount ?? 0);

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!invoice.clientId) {
      toast.error("Client is required");
      return;
    }

    if (isNewClient) {
      const clientId = await clientsStore.upsertClient(newClient);
      if (!clientId) {
        toast.error("Failed to create client");
        return;
      }
      invoice.clientId = clientId;
    }

    // Sync discount back to invoice before saving
    invoice.discount = discount;

    // Single upsert call - much simpler!
    await invoicesStore.upsertInvoice(invoice);
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
          {#each clientsStore.clients as { id, name } (id)}
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
        <select name="state" id="state" bind:value={newClient.state}>
          {#each states as state (state.name)}
            {@render State(state)}
          {/each}
        </select>
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
    <LineItemRows bind:discount bind:lineItems {addLineItem} {removeLineItem} />
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

{#snippet State({ value, name }: (typeof states)[number])}
  <option {value}>{name}</option>
{/snippet}

<ConfirmDelete {invoice} bind:open />
