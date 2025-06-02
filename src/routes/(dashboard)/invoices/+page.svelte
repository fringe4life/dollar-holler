<script lang="ts">
  import CircledAmount from '$lib/components/CircledAmount.svelte'
  import Search from '$lib/components/Search.svelte'

  import { invoices, loadInvoices } from '$lib/stores/InvoiceStore'
  import { onMount } from 'svelte'
  import { centsToDollars, sumInvoices } from '$lib/utils/moneyHelpers'
  import InvoiceRow from './InvoiceRow.svelte'
  import BlankState from './BlankState.svelte'
  import InvoiceRowHeader from './InvoiceRowHeader.svelte'
  import Portal from '$lib/components/Portal.svelte'
  import Modal from '$lib/components/Modal.svelte'

  onMount(() => {
    loadInvoices()
  })

  const amount = centsToDollars(sumInvoices($invoices))
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
  <div>
    <button
      class="after:shadow-coloredHover shadow-colored bg-lavenderIndigo font-sansserif relative translate-y-0 rounded-lg px-10 py-3 text-xl font-black whitespace-nowrap text-white after:absolute after:inset-0 after:rounded-lg after:opacity-0 after:transition-opacity after:duration-200 hover:-translate-1 hover:after:opacity-100"
      >+ Invoice</button
    >
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
    <CircledAmount {amount} label="Total" />
  {:else}
    <BlankState />
  {/if}
</div>

<Modal {open} buttonText="Open sesmae">
  {#snippet title()}
    <h2>Modal title</h2>
  {/snippet}

  {#snippet description()}
    <h2>Modal title</h2>
  {/snippet}
</Modal>
