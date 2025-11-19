<script lang="ts">
  import AdditionalOptions from '$lib/components/AdditionalOptions.svelte'
  import { Badge } from '$lib/components/ui/badge'

  import { swipe } from '$lib/attachments/swipe.svelte'
  import { clickOutside } from '$lib/attachments/clickOutside'
  import SlidePanel from '$lib/components/SlidePanel.svelte'
  import type { ClientWithInvoicesResponse } from '$lib/validators'
  import Activate from '$lib/icon/Activate.svelte'
  import Archive from '$lib/icon/Archive.svelte'
  import Cancel from '$lib/icon/Cancel.svelte'
  import Edit from '$lib/icon/Edit.svelte'
  import ThreeDots from '$lib/icon/ThreeDots.svelte'
  import Trash from '$lib/icon/Trash.svelte'
  import View from '$lib/icon/View.svelte'
  import { resolve } from '$app/paths'
  import { centsToDollars, sumInvoices } from '$lib/utils/moneyHelpers'
  import type { MouseEventHandler } from 'svelte/elements'
  import ClientForm from './ClientForm.svelte'
  import ConfirmClientDelete from './ConfirmClientDelete.svelte'
  type Props = {
    client: ClientWithInvoicesResponse
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

  const closeOptions = () => {
    isAdditionalMenuShowing = false
  }

  const receivedInvoices = () => {
    // find invoices that have been paid
    const paidInvoices = sumInvoices(
      client?.invoices?.filter(i => i.invoiceStatus === 'paid') || []
    )
    return centsToDollars(paidInvoices)
    // get sum of those invoices
  }

  const balanceInvoices = () => {
    const unpaidInvoices = sumInvoices(
      client?.invoices?.filter(i => i.invoiceStatus !== 'paid') || []
    )
    return centsToDollars(unpaidInvoices)
    // get sum of those invoices
  }
  let triggerReset = $state(false)

  // @ts-expect-error - resolve function supports 2 arguments in SvelteKit v2.26+
  const resolved = resolve('/clients/[id]', { id: client.id })
</script>

<div class="relative isolate">
  <div
    {@attach swipe({ triggerReset: triggerReset })}
    class="client-table client-row shadow-tableRow relative z-5 items-center rounded-lg bg-white py-3 lg:py-6"
  >
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
      <a
        class="text-pastelPurple hover:text-daisyBush transition-colors duration-200"
        href={resolved}><View /></a
      >
    </div>
    <div class="relative hidden place-self-center lg:grid">
      <button
        {@attach isAdditionalMenuShowing && clickOutside(closeOptions)}
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
              disabled: client.clientStatus === 'active',
            },
            {
              label: 'Archive',
              icon: Archive,
              onclick: handleArchive,
              disabled: client.clientStatus === 'archive',
            },
          ]}
        />
      {/if}
    </div>
  </div>

  <!-- revealed on swipe -->
  <div class="swipe-revealed-actions">
    <button onclick={() => (triggerReset = true)} class="action-button">
      <Cancel width={32} height={32} />
      Cancel
    </button>
    {#if client.clientStatus === 'active'}
      <button onclick={handleArchive} class="action-button">
        <Archive width={32} height={32} />
        Archive
      </button>
    {/if}
    {#if client.clientStatus === 'archive'}
      <button onclick={handleActivation} class="action-button">
        <Activate width={32} height={32} />
        Activate
      </button>
    {/if}
    <button onclick={handleDelete} class="action-button">
      <Trash width={32} height={32} />
      Delete
    </button>
    <a class="action-button" href={resolved}><View height={32} width={32} /></a>
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

  <ClientForm formState="edit" bind:edit={client} closePanel={() => (isFormShowing = false)} />
</SlidePanel>

<ConfirmClientDelete bind:open {client} />

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
