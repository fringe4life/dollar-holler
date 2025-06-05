<script lang="ts">
  import AdditionalOptions from '$lib/components/AdditionalOptions.svelte'
  import Badge, { type BadgeVariant } from '$lib/components/ui/badge/badge.svelte'
  import ThreeDots from '$lib/icon/ThreeDots.svelte'
  import View from '$lib/icon/View.svelte'
  import { convertDate, isLate } from '$lib/utils/dateHelpers'
  import SlidePanel from '$lib/components/SlidePanel.svelte'
  import { getTotal } from '$lib/utils/moneyHelpers'
  import type { MouseEventHandler } from 'svelte/elements'
  import type { Invoice } from '../../../global'
  import Send from '$lib/icon/Send.svelte'
  import Edit from '$lib/icon/Edit.svelte'
  import Trash from '$lib/icon/Trash.svelte'

  import InvoiceForm from '$lib/components/invoiceForm.svelte'
  import ConfirmDelete from './ConfirmDelete.svelte'

  let isAdditionalMenuShowing = $state(false)
  let isOptionsDisabled = $state(false)
  let { invoice } = $props<{
    invoice: Invoice
  }>()

  const onclick: MouseEventHandler<HTMLButtonElement> = () => {
    isAdditionalMenuShowing = !isAdditionalMenuShowing
  }

  const getLabel = (label: BadgeVariant, dueDate: string | undefined): BadgeVariant => {
    if (label === 'draft') {
      return 'draft'
    } else if (label === 'sent' && isLate?.(dueDate)) {
      isOptionsDisabled = true
      return 'late'
    } else if (label === 'sent' && !isLate?.(dueDate)) {
      isOptionsDisabled = true
      return 'sent'
    } else if (label === 'paid') {
      isOptionsDisabled = true
      return 'paid'
    }
  }

  let open = $state<boolean>(false)
  let isInvoiceShowingPanel = $state<boolean>(false)

  const handleDelete: MouseEventHandler<HTMLButtonElement> = () => {
    open = true
    isAdditionalMenuShowing = false
  }

  const handleEdit: MouseEventHandler<HTMLButtonElement> = () => {
    isInvoiceShowingPanel = true
    isAdditionalMenuShowing = false
  }

  const handleSendInvoice: MouseEventHandler<HTMLButtonElement> = () => {}

  const { invoiceStatus, dueDate, invoiceNumber, client, lineItems } = invoice

  const label = getLabel(invoiceStatus, dueDate)
</script>

<div
  class="invoice-table invoice-row shadow-tableRow items-center justify-between rounded-lg bg-white py-3 lg:py-6"
>
  <div class="status justify-self-end">{@render tag(label)}</div>
  <div class="duedate text-sm lg:text-lg">{convertDate(dueDate)}</div>
  <div class="invoicenumber text-sm lg:text-lg">{invoiceNumber}</div>
  <div class="clientname text-base font-bold lg:text-xl">{client.name}</div>
  <div class="amount text-right font-mono text-sm font-bold lg:text-lg">
    {getTotal(invoice)}
  </div>
  <div
    class="hover:text-daisyBush viewbutton text-pastelPurple hidden text-sm transition-colors duration-200 md:place-self-center lg:block lg:text-lg"
  >
    <!-- svelte-ignore a11y_invalid_attribute -->
    <a href="#" class=""><View /></a>
  </div>
  <div
    class="text-pastelPurple morebutton hover:text-daisyBush relative hidden place-self-center text-sm transition-colors duration-200 lg:block lg:text-lg"
  >
    <button {onclick} class="flex cursor-pointer items-center justify-center"><ThreeDots /></button>
    {#if isAdditionalMenuShowing}
      <AdditionalOptions
        options={[
          { label: 'Edit', icon: Edit, onclick: handleEdit, disabled: isOptionsDisabled },

          { label: 'Delete', icon: Trash, onclick: handleDelete, disabled: false },

          { label: 'Send', icon: Send, onclick: handleSendInvoice, disabled: isOptionsDisabled }
        ]}
      />
    {/if}
  </div>
</div>

{#snippet tag(title: BadgeVariant)}
  <Badge class="ml-auto lg:ml-0" variant={title} size="small">{title}</Badge>
{/snippet}

<ConfirmDelete className="" bind:open {invoice} />

<SlidePanel bind:open={isInvoiceShowingPanel} buttonText="">
  {#snippet title()}
    <h2 class="font-sansserif text-daisyBush mb-7 text-3xl font-bold">Edit an Invoice</h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  {#snippet children()}
    <InvoiceForm
      formState="edit"
      bind:invoiceEdit={invoice}
      closePanel={() => (isInvoiceShowingPanel = false)}
    />
  {/snippet}
</SlidePanel>

<style>
  .invoice-row {
    grid-template-areas:
      'invoicenumber invoicenumber '
      'clientname    amount'
      'duedate       status';
    @media screen and (width > 1024px) {
      grid-template-areas: 'status duedate invoicenumber clientname amount viewbutton morebutton';
    }
  }

  .status {
    grid-area: status;
  }
  .duedate {
    grid-area: duedate;
  }
  .invoicenumber {
    grid-area: invoicenumber;
  }
  .clientname {
    grid-area: clientname;
  }

  .amount {
    grid-area: amount;
  }

  .viewbutton {
    grid-area: viewbutton;
  }
  .morebutton {
    grid-area: morebutton;
  }
</style>
