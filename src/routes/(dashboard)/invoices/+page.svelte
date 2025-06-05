<script lang="ts">
  import CircledAmount from '$lib/components/CircledAmount.svelte'
  import Search from '$lib/components/Search.svelte'

  import { invoices, loadInvoices } from '$lib/stores/InvoiceStore'
  import { onMount } from 'svelte'
  import { centsToDollars, sumInvoices } from '$lib/utils/moneyHelpers'
  import InvoiceRow from './InvoiceRow.svelte'
  import BlankState from './BlankState.svelte'
  import InvoiceRowHeader from './InvoiceRowHeader.svelte'

  import { Button } from '$lib/components/ui/button'
  import SlidePanel from '$lib/components/SlidePanel.svelte'
  import InvoiceForm from '$lib/components/invoiceForm.svelte'

  onMount(() => {
    loadInvoices()
  })

  $inspect(invoices)
  let isInvoiceShowingPanel = $state(false)
</script>

<svelte:head>
  <title>Invoices | Doller Holla</title>
</svelte:head>
<div
  class="mb-7 flex flex-col-reverse items-start justify-between gap-y-6 px-5 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mb-16 lg:px-10 lg:py-3 lg:text-lg"
>
  <!-- search field -->
  {#if $invoices.length > 0}
    <Search />
  {:else}
    <div></div>
  {/if}
  <!-- new invoice button -->
  <div class="z-1">
    <Button onclick={() => (isInvoiceShowingPanel = true)} size="lg">+ Invoice</Button>
  </div>
</div>
<div>
  <!-- invoices -->
  {#if !$invoices}
    <p>Loading...</p>
  {:else if $invoices.length > 0}
    <InvoiceRowHeader />
    <div class="flex flex-col-reverse">
      {#each $invoices as invoice (invoice.invoiceNumber)}
        <InvoiceRow {invoice} />
      {/each}
    </div>
    <CircledAmount amount={centsToDollars(sumInvoices($invoices))} label="Total" />
  {:else}
    <BlankState />
  {/if}
</div>

<SlidePanel bind:open={isInvoiceShowingPanel} buttonText="">
  {#snippet title()}
    <h2 class="font-sansserif text-daisyBush mt-9 mb-7 text-3xl font-bold lg:mt-0">
      Add an Invoice
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  {#snippet children()}
    <InvoiceForm
      invoiceEdit={undefined}
      formState="create"
      closePanel={() => (isInvoiceShowingPanel = false)}
    />
  {/snippet}
</SlidePanel>
