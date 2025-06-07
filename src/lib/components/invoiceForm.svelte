<script lang="ts">
  import { addClient, clients, loadClients } from '$lib/stores/clientStore'
  import { states } from '$lib/utils/states'
  import Trash from '$lib/icon/Trash.svelte'
  import type { FormEventHandler, MouseEventHandler } from 'svelte/elements'
  import type { Client, Invoice, LineItem } from '../../global'
  import LineItemRows from '../../routes/(dashboard)/invoices/LineItemRows.svelte'
  import Button from './ui/button/button.svelte'
  import { slide } from 'svelte/transition'
  import { onMount } from 'svelte'
  import { today } from '$lib/utils/dateHelpers'
  import { addInvoice, updateInvoice } from '$lib/stores/InvoiceStore'
  import ConfirmDelete from '../../routes/(dashboard)/invoices/ConfirmDelete.svelte'
  import { toast } from 'svelte-sonner'

  type Panel = {
    closePanel: () => void
  }

  type EditProps = {
    invoiceEdit: Invoice
    formState: 'edit'
  } & Panel

  type CreateProps = {
    formState: 'create'
    invoiceEdit: undefined
  } & Panel

  type Props = CreateProps | EditProps

  let { formState = 'create', closePanel, invoiceEdit = $bindable() }: Props = $props()

  onMount(() => {
    loadClients()
  })

  const blankLineItem: Omit<LineItem, 'id'> = {
    description: '',
    amount: 0,
    quantity: 0
  }

  let invoice = $state<Invoice>({
    client: {} as Client,
    createdAt: '',
    dueDate: '',
    id: crypto.randomUUID(),
    invoiceNumber: '',
    invoiceStatus: 'draft',
    issueDate: '',
    subject: '',
    terms: '',
    notes: '',

    lineItems: [
      {
        id: crypto.randomUUID(),
        description: 'big job',
        amount: 30,
        quantity: 5
      },
      {
        id: crypto.randomUUID(),
        description: 'little job',
        amount: 30000,
        quantity: 5
      },
      {
        id: crypto.randomUUID(),
        description: 'just right job',
        amount: 300000,
        quantity: 50
      }
    ] satisfies LineItem[]
  }) as Invoice

  if (formState === 'edit') {
    invoice = invoiceEdit as Invoice
    console.log('hello')
  }

  const addLineItem: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = () => {
    invoice.lineItems = [
      ...(invoice?.lineItems as LineItem[]),
      { ...blankLineItem, id: crypto.randomUUID() }
    ]
  }

  const removeLineItem = (id: string) => {
    console.log(id)
    invoice.lineItems =
      invoice?.lineItems && invoice?.lineItems.filter(lineItem => lineItem.id !== id)
  }

  let isNewClient = $state<boolean>(false)

  let newClient: Partial<Client> = $state({
    clientStatus: 'active',
    city: '',
    email: '',
    id: '',
    name: '',
    state: '',
    street: '',
    zip: ''
  })

  let discount = $derived<number>(invoice.discount || 0)

  const handleSubmit: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    if (isNewClient) {
      addClient(newClient as Client)
      invoice.client = newClient as Client
    }
    if (formState === 'create') {
      addInvoice(invoice)
      toast.success('Your invoice was successfully created.')
    } else {
      updateInvoice(invoice)
      toast.success('Your invoice was successfully updated.')
    }
    closePanel()
  }

  let open = $state<boolean>(false)

  $effect(() => {
    invoice.discount = discount
  })
</script>

<form class="grid grid-cols-6 gap-x-2 md:gap-x-5" onsubmit={handleSubmit}>
  <!-- client -->

  <div class="field col-span-6 md:col-span-4">
    {#if !isNewClient}
      <label for="client">Client</label>
      <div class="flex flex-wrap items-end gap-x-2 sm:flex-nowrap md:gap-x-5">
        <select
          id="client"
          onchange={() => {
            const selectedClient = $clients.find(client => client.id === invoice.client.id)
            console.log({ selectedClient })
            invoice.client.name = selectedClient?.name === undefined ? '' : selectedClient.name
          }}
          name="client"
          required={!isNewClient}
          bind:value={invoice.client.id}
          class="mb-2 sm:mb-0"
        >
          {#each $clients as { id, name } (id)}
            <option value={id}>{name}</option>
          {/each}
        </select>
        <p class="text-monsoon text-base leading-9 font-bold lg:leading-14">or</p>
        <Button
          variant="outline"
          onclick={() => {
            isNewClient = true
            invoice.client.name = ''
            invoice.client.email = ''
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
            isNewClient = false
            newClient = {}
          }}>Existing Client</Button
        >
      </div>
    {/if}
  </div>

  <!-- invoiceid -->
  <div class="field -order-1 col-span-6 self-end sm:order-0 sm:col-span-2">
    <label for="invoiceNumber">InvoiceNumber</label>
    <input type="number" name="invoiceNumber" required bind:value={invoice.invoiceNumber} />
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
        <input bind:value={newClient.email} type="text" name="street" id="street" />
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
        <input bind:value={newClient.zip} type="text" name="zipCode" id="zipCode" />
      </div>
    </div>
  {/if}

  <!-- duedate -->
  <div class="field col-span-3 sm:col-span-2">
    <label for="dueDate">Due Date</label>
    <input required type="date" name="dueDate" min={today} bind:value={invoice.dueDate} />
  </div>
  <!-- issue date -->
  <div class="field col-span-3 sm:col-span-2 md:col-start-5">
    <label for="issueDate">Issue Date</label>
    <input type="date" name="issueDate" min={today} bind:value={invoice.issueDate} />
  </div>
  <!-- subject -->
  <div class="field col-span-6">
    <label for="subject">Subject</label>
    <input type="text" name="subject" bind:value={invoice.subject} />
  </div>
  <!-- line items -->
  <div class="field col-span-6">
    <LineItemRows bind:discount bind:lineItems={invoice.lineItems} {addLineItem} {removeLineItem} />
  </div>

  <!-- notes -->
  <div class="field col-span-6">
    <label for="notes"
      >Notes <span class="font-normal">(optional, displayed on invoice)</span></label
    >
    <textarea bind:value={invoice.notes} name="notes" id="notes"></textarea>
  </div>
  <!-- terms -->
  <div class="field col-span-6">
    <label for="terms"
      >Terms <span class="font-normal">(optional, displayed on invoice)</span></label
    >
    <textarea bind:value={invoice.terms} name="terms" id="terms"></textarea>
    <p class="text-xs text-gray-400">Formatting tips: <strong>*bold*</strong>, <em>_italic_</em></p>
  </div>
  <!-- buttons -->
  <div class="field col-span-2">
    <!-- delete button only visible if editing -->
    {#if formState === 'edit'}
      <Button variant="textOnlyDestructive" onclick={() => (open = true)}><Trash />Delete</Button>
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
