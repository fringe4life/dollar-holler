<script lang="ts">
  import AdditionalOptions from '$lib/components/AdditionalOptions.svelte'
  import { Badge } from '$lib/components/ui/badge'

  import ThreeDots from '$lib/icon/ThreeDots.svelte'
  import View from '$lib/icon/View.svelte'
  import Edit from '$lib/icon/Edit.svelte'
  import Archive from '$lib/icon/Archive.svelte'
  import Activate from '$lib/icon/Activate.svelte'
  import Trash from '$lib/icon/Trash.svelte'
  import type { MouseEventHandler } from 'svelte/elements'
  import type { Client } from '../../../global'
  import { centsToDollars, getTotal, sumInvoices } from '$lib/utils/moneyHelpers'
  import SlidePanel from '$lib/components/SlidePanel.svelte'
  import ClientForm from './ClientForm.svelte'

  type Props = {
    client: Client
  }

  let { client = $bindable() }: Props = $props()

  let isFormShowing = $state<boolean>(false)
  let open = $state<boolean>(false)

  let isAdditionalMenuShowing = $state(false)
  let isOptionsDisabled = $state(false)

  const handleDelete: MouseEventHandler<HTMLButtonElement> = () => {
    open = true
    isAdditionalMenuShowing = false
  }

  const handleEdit: MouseEventHandler<HTMLButtonElement> = () => {
    isFormShowing = true
    isAdditionalMenuShowing = false
  }

  const handleMenu: MouseEventHandler<HTMLButtonElement> = () => {
    isAdditionalMenuShowing = !isAdditionalMenuShowing
    console.log('Clicked')
  }

  const handleActivation: MouseEventHandler<HTMLButtonElement> = () => {
    client.clientStatus = 'active'
    isAdditionalMenuShowing = false
  }

  const handleArchive: MouseEventHandler<HTMLButtonElement> = () => {
    client.clientStatus = 'archive'
    isAdditionalMenuShowing = false
  }

  const receivedInvoices = () => {
    // find invoices that have been paid
    const paidInvoices = sumInvoices(
      client?.invoices?.filter(invoice => invoice.invoiceStatus === 'paid')
    )
    return centsToDollars(paidInvoices)
    // get sum of those invoices
  }

  const balanceInvoices = () => {
    const paidInvoices = sumInvoices(
      client?.invoices?.filter(invoice => invoice.invoiceStatus !== 'paid')
    )
    return centsToDollars(paidInvoices)
    // get sum of those invoices
  }
</script>

<!-- <svelte:window onclick={() => (isAdditionalMenuShowing = false)} /> -->

<div class="client-table client-row shadow-tableRow items-center rounded-lg bg-white py-3 lg:py-6">
  <div class="status">{@render tag(client.clientStatus as string)}</div>
  <div class="clientName truncate text-base font-bold whitespace-nowrap lg:text-xl">
    {client.name}
  </div>
  <div class="received text-right font-mono text-sm font-bold lg:text-lg">
    {receivedInvoices()}
  </div>
  <div class="text-scarlet balance text-right font-mono text-sm font-bold lg:text-lg">
    {balanceInvoices()}
  </div>
  <div class="view relative hidden place-self-center lg:block">
    <a class="text-pastelPurple hover:text-daisyBush transition-colors duration-200" href={`/clients/${client.id}`}
      ><View /></a
    >
  </div>
  <div class="relative hidden place-self-center lg:grid">
    <button
      onclick={handleMenu}
      class="text-pastelPurple hover:text-daisyBushtransition-colors duration-200"
      ><ThreeDots /></button
    >
    {#if isAdditionalMenuShowing}
      <AdditionalOptions
        options={[
          { label: 'Edit', icon: Edit, onclick: handleEdit, disabled: isOptionsDisabled },

          { label: 'Delete', icon: Trash, onclick: handleDelete, disabled: isOptionsDisabled },
          {
            label: 'Active',
            icon: Activate,
            onclick: handleActivation,
            disabled: client.clientStatus === 'active'
          },
          {
            label: 'Archive',
            icon: Archive,
            onclick: handleArchive,
            disabled: client.clientStatus === 'archive'
          }
        ]}
      />
    {/if}
  </div>
</div>

{#snippet tag(title: string)}
  <Badge class="ml-auto " variant="draft" size="small">{title}</Badge>
{/snippet}

<SlidePanel bind:open={isFormShowing} buttonText="">
  {#snippet title()}
    <h2 class="font-sansserif text-daisyBush mb-7 text-3xl font-bold">Edit an Invoice</h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  {#snippet children()}
    <ClientForm formState="edit" bind:edit={client} closePanel={() => (isFormShowing = false)} />
  {/snippet}
</SlidePanel>

<style>
  @reference "../../../app.css";

  .client-row {
    grid-template-areas:
      'clientName status'
      'received balance';

    @media screen and (width > 1024px) {
      grid-template-areas: 'status clientName received balance view threeDots';
    }
  }
  .clientName {
    grid-area: clientName;
  }
  .status {
    grid-area: status;
  }
  .received {
    grid-area: received;
    @apply text-left lg:text-right;
    &::before {
      content: 'Received: ' / 'your received money is';
      @apply block text-xs font-bold lg:hidden;
    }
  }
  .balance {
    grid-area: balance;
    @apply text-left lg:text-right;
    &::before {
      content: 'Balance: ' / 'Your balance is';
      @apply block text-xs font-bold lg:hidden;
    }
  }
  .view {
  }
</style>
