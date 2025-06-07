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

  type Props = {
    client: Client
  }

  let { client = $bindable() }: Props = $props()

  $inspect(client)

  let isAdditionalMenuShowing = $state(false)
  let isOptionsDisabled = $state(false)
  function handleEdit(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    throw new Error('Function not implemented.')
  }

  function handleDelete(event: MouseEvent & { currentTarget: EventTarget & HTMLButtonElement }) {
    throw new Error('Function not implemented.')
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
    const paidInvoices = client?.invoices.filter(invoice => invoice.invoiceStatus === 'paid')

    // get sum of those invoices
  }

  const balanceInvoices = () => {}
</script>

<!-- <svelte:window onclick={() => (isAdditionalMenuShowing = false)} /> -->

<div class="client-table client-row shadow-tableRow rounded-lg bg-white py-3 lg:py-6">
  <div class="status">{@render tag(client.clientStatus as string)}</div>
  <div class="clientName truncate text-base font-bold whitespace-nowrap lg:text-xl">
    {client.name}
  </div>
  <div class="received text-right font-mono text-sm font-bold lg:text-lg">$504.00</div>
  <div class="text-scarlet balance text-right font-mono text-sm font-bold lg:text-lg">$240.00</div>
  <div class="view relative hidden place-self-center lg:block">
    <a
      class="text-pastelPurple hover:text-daisyBush transition-colors duration-200"
      href={'/node_modules'}><View /></a
    >
  </div>
  <div class="relative hidden place-self-center lg:block">
    <button
      onclick={handleMenu}
      class="text-pastelPurple hover:text-daisyBush transition-colors duration-200"
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
