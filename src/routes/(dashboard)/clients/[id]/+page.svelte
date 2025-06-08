<script lang="ts">
  import CircledAmount from '$lib/components/CircledAmount.svelte'
  import Search from '$lib/components/Search.svelte'
  import { centsToDollars, sumInvoices } from '$lib/utils/moneyHelpers'
  import BlankState from '../BlankState.svelte'

  import { Button } from '$lib/components/ui/button'
  import SlidePanel from '$lib/components/SlidePanel.svelte'
  import ClientForm, { type Props } from '../ClientForm.svelte'
  import Edit from '$lib/icon/Edit.svelte'
  import type { MouseEventHandler } from 'svelte/elements'
  import InvoiceRowHeader from '../../invoices/InvoiceRowHeader.svelte'
  import InvoiceRow from '../../invoices/InvoiceRow.svelte'
  import { isLate } from '$lib/utils/dateHelpers'

  let { data } = $props()
  let isFormShowing = $state<boolean>(false)
  let isEditing = $state<Props['formState']>('create')

  const handleEdit: MouseEventHandler<HTMLButtonElement> &
    MouseEventHandler<HTMLAnchorElement> = () => {
    isEditing = 'edit'
    isFormShowing = true
  }

  const getDraft = (): string => {
    const draftInvoices = data.client.invoices?.filter(invoice => invoice.invoiceStatus === 'draft')
    return centsToDollars(sumInvoices(draftInvoices))
  }

  const getPaid = (): string => {
    const paidInvoices = data.client.invoices?.filter(invoice => invoice.invoiceStatus === 'paid')
    return centsToDollars(sumInvoices(paidInvoices))
  }

  const getOverdue = (): string => {
    const overdueInvoices = data.client.invoices?.filter(invoice => {
      if (isLate(invoice.dueDate) && invoice.invoiceStatus === 'sent') {
        return true
      }
      return false
    })
    return centsToDollars(sumInvoices(overdueInvoices))
  }

  const getOustanding = (): string => {
    const overdueInvoices = data.client.invoices?.filter(invoice => {
      if (!isLate(invoice.dueDate) && invoice.invoiceStatus === 'sent') {
        return true
      }
      return false
    })
    return centsToDollars(sumInvoices(overdueInvoices))
  }
</script>

<svelte:head>
  <title>{data.client.name} | Doller Holla</title>
</svelte:head>
<div
  class="mb-7 flex flex-col-reverse items-start justify-between gap-y-6 px-5 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mb-16 lg:px-10 lg:py-3 lg:text-lg"
>
  <!-- search field -->
  {#if data.client.invoices && data.client.invoices.length > 0}
    <Search />
  {:else}
    <div></div>
  {/if}
  <!-- new invoice button -->
  <div class="z-1">
    <Button onclick={() => (isFormShowing = true)} size="lg">+ Client</Button>
  </div>
</div>

<div class="mb-7 flex w-full items-center justify-between">
  <h1 class="font-sansserif text-daisyBush text-3xl font-bold">{data.client.name}</h1>
  <Button variant="textOnly" onclick={handleEdit}><Edit /> Edit</Button>
</div>

<div class="bg-gallery mb-10 grid grid-cols-1 gap-4 rounded-lg px-10 py-7 lg:grid-cols-4">
  <div class="summary-block">
    <div class="label">Total Overdue</div>
    <div class="number">{getOverdue()}</div>
  </div>
  <div class="summary-block">
    <div class="label">Total Outstanding</div>
    <div class="number">{getOustanding()}</div>
  </div>
  <div class="summary-block">
    <div class="label">Total Draft</div>
    <div class="number">{getDraft()}</div>
  </div>
  <div class="summary-block">
    <div class="label">Total Paid</div>
    <div class="number">{getPaid()}</div>
  </div>
</div>

<!-- list of invoices -->
<div>
  <!-- invoices -->
  {#if !data.client.invoices}
    <p>Loading...</p>
  {:else if data.client.invoices.length > 0}
    <InvoiceRowHeader />
    <div class="flex flex-col-reverse">
      {#each data.client.invoices as invoice (invoice.invoiceNumber)}
        <InvoiceRow {invoice} />
      {/each}
    </div>
    <CircledAmount amount={centsToDollars(sumInvoices(data.client.invoices))} label="Total" />
  {:else}
    <BlankState />
  {/if}
</div>

<SlidePanel bind:open={isFormShowing} buttonText="">
  {#snippet title()}
    <h2 class="font-sansserif text-daisyBush mt-9 mb-7 text-3xl font-bold lg:mt-0">Add a Client</h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  {#snippet children()}
    <ClientForm
      edit={isEditing === 'edit' ? data.client : undefined}
      formState={isEditing}
      closePanel={() => {
        isFormShowing = false
        isEditing = 'create'
      }}
    />
  {/snippet}
</SlidePanel>

<style>
  @reference "../../../../app.css";
  .summary-block {
    @apply text-center;
  }

  .label {
    @apply text-lightGray text-sm font-black;
  }
  sup {
    @apply relative -top-2;
  }

  .number {
    @apply text-purple truncate text-4xl font-black;
  }
</style>
