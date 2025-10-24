<script lang="ts">
  import CircledAmount from '$lib/components/CircledAmount.svelte'
  import Search from '$lib/components/Search.svelte'

  import { invoices, loadInvoices } from '$lib/stores/InvoiceStore.svelte'
  import { centsToDollars, sumInvoices } from '$lib/utils/moneyHelpers'
  import { onMount } from 'svelte'
  import BlankState from './BlankState.svelte'
  import InvoiceRow from './InvoiceRow.svelte'
  import InvoiceRowHeader from './InvoiceRowHeader.svelte'

  import SlidePanel from '$lib/components/SlidePanel.svelte'
  import InvoiceForm from '$lib/components/invoice-form.svelte'
  import { Button } from '$lib/components/ui/button'
  import type { InvoiceWithRelationsResponse } from '$lib/validators'
  import NoSearchResults from './NoSearchResults.svelte'

  let listInvoices: InvoiceWithRelationsResponse[] = $state([])
  onMount(async () => {
    await loadInvoices()
    listInvoices = invoices
  })

  let isInvoiceShowingPanel = $state(false)

  const handleSearch = (searchTerms: string): void => {
    console.log(searchTerms)
    listInvoices = invoices.filter(invoice => {
      return (
        invoice.client.name.toLowerCase().includes(searchTerms.toLowerCase()) ||
        invoice.invoiceNumber.toLowerCase().includes(searchTerms.toLowerCase()) ||
        invoice?.subject?.toLowerCase().includes(searchTerms.toLowerCase())
      )
    })
  }
</script>

<svelte:head>
  <title>Invoices | Doller Holla</title>
</svelte:head>
<div
  class="mb-7 flex flex-col-reverse items-start justify-between gap-y-6 px-5 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mb-16 lg:px-10 lg:py-3 lg:text-lg"
>
  <!-- search field -->
  {#if invoices.length > 0}
    <Search {handleSearch} />
  {:else}
    <div></div>
  {/if}
  <!-- new invoice button -->
  <div class="z-1">
    <Button onclick={() => (isInvoiceShowingPanel = true)} size="lg">+ Invoice</Button>
  </div>
</div>
<!-- list of invoices -->
<div>
  <!-- invoices -->
  {#if !invoices}
    <p>Loading...</p>
  {:else if listInvoices.length === 0}
    <NoSearchResults />
  {:else if listInvoices.length > 0}
    <InvoiceRowHeader />
    <div class="flex flex-col-reverse">
      {#each listInvoices as invoice (invoice.invoiceNumber)}
        <InvoiceRow {invoice} />
      {/each}
    </div>
    <CircledAmount amount={centsToDollars(sumInvoices(listInvoices))} label="Total" />
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

  <InvoiceForm
    invoiceEdit={undefined}
    formState="create"
    closePanel={() => (isInvoiceShowingPanel = false)}
  />
</SlidePanel>
