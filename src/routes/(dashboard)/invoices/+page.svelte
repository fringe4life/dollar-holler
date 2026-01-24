<script lang="ts">
  import InvoiceWithDetails from "$lib/components/InvoiceWithDetails.svelte";
  import Search from "$lib/components/Search.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import {
    error,
    invoices,
    invoicesStore,
    loading,
  } from "$lib/stores/invoicesStore.svelte";
  import { onMount } from "svelte";
  import BlankState from "./BlankState.svelte";
  import NoSearchResults from "./NoSearchResults.svelte";

  let searchTerms = $state<string>("");
  let isFormVisible = $state<boolean>(false);

  // Derived state for filtered invoices
  const filteredInvoices = $derived.by(() => {
    if (!searchTerms) return invoices;

    return invoices.filter((invoice) => {
      return (
        invoice.invoiceNumber
          ?.toLowerCase()
          .includes(searchTerms.toLowerCase()) ||
        invoice.subject?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        invoice.invoiceStatus?.toLowerCase().includes(searchTerms.toLowerCase())
        // invoice.total?.toString().includes(searchTerms)
      );
    });
  });

  onMount(async () => {
    await invoicesStore.loadInvoices();
  });

  const handleSearch = (terms: string) => {
    searchTerms = terms;
  };
</script>

<svelte:head>
  <title>Invoices | Dollar Holler</title>
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
    <Button
      onclick={() => {
        isFormVisible = true;
      }}
      size="lg">+ Invoice</Button
    >
  </div>
</div>

<!-- list of invoices -->
<div>
  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="text-lg">Loading invoices...</div>
    </div>
  {:else if error}
    <div class="flex items-center justify-center py-8">
      <div class="text-lg text-red-500">Error: {error}</div>
    </div>
  {:else if invoices.length === 0}
    <BlankState />
  {:else if filteredInvoices.length === 0}
    <NoSearchResults />
  {:else}
    <!-- invoice cards with details loaded separately -->
    <div class="space-y-4">
      {#each filteredInvoices as invoice (invoice.id)}
        <InvoiceWithDetails {invoice} />
      {/each}
    </div>
  {/if}
</div>

<SlidePanel bind:open={isFormVisible} buttonText="">
  {#snippet title()}
    <h2
      class="font-sansserif text-daisyBush mt-9 mb-7 text-3xl font-bold lg:mt-0"
    >
      Add an Invoice
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  <!-- Invoice form would go here -->
  <div class="p-4">
    <p>Invoice form component would be integrated here</p>
  </div>
</SlidePanel>
