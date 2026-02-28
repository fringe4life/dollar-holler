<script lang="ts">
  import ClientWithInvoices from "$lib/components/ClientWithInvoices.svelte";
  import Search from "$lib/components/Search.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import {
    clients,
    clientsStore,
    error,
    loading,
  } from "$lib/stores/clientsStore.svelte";
  import { onMount } from "svelte";
  import NoSearchResults from "../invoices/NoSearchResults.svelte";
  import BlankState from "./BlankState.svelte";
  import ClientForm from "./ClientForm.svelte";

  let searchTerms = $state("");
  let isFormVisible = $state<boolean>(false);

  // Derived state for filtered clients
  const filteredClients = $derived.by(() => {
    if (!searchTerms) return clients;

    return clients.filter((client) => {
      return (
        client.city?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client?.state?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client?.zip?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client?.email?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client?.street?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client?.clientStatus
          ?.toLowerCase()
          .includes(searchTerms.toLowerCase()) ||
        client.name.toLowerCase().includes(searchTerms.toLowerCase())
      );
    });
  });

  onMount(async () => {
    await clientsStore.loadClients();
  });

  const handleSearch = (terms: string) => {
    searchTerms = terms;
  };
</script>

<svelte:head>
  <title>Clients | Dollar Holler</title>
</svelte:head>

<div
  class="mb-7 flex flex-col-reverse items-start justify-between gap-y-6 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mb-16 lg:py-3 lg:text-lg"
>
  <!-- search field -->
  {#if clients.length > 0}
    <Search {handleSearch} />
  {:else}
    <div></div>
  {/if}
  <!-- new client button -->
  <div class="z-1">
    <Button
      onclick={() => {
        isFormVisible = true;
      }}
      size="lg">+ Client</Button
    >
  </div>
</div>

<!-- list of clients -->
<div>
  {#if loading}
    <div class="flex items-center justify-center py-8">
      <div class="text-lg">Loading clients...</div>
    </div>
  {:else if error}
    <div class="flex items-center justify-center py-8">
      <div class="text-lg text-red-500">Error: {error}</div>
    </div>
  {:else if clients.length === 0}
    <BlankState />
  {:else if filteredClients.length === 0}
    <NoSearchResults />
  {:else}
    <!-- client cards with invoices loaded separately -->
    <div class="space-y-4">
      {#each filteredClients as client (client.id)}
        <ClientWithInvoices {client} />
      {/each}
    </div>
  {/if}
</div>

<SlidePanel bind:open={isFormVisible} buttonText="">
  {#snippet title()}
    <h2
      class="font-sansserif text-daisyBush mt-9 mb-7 text-3xl font-bold lg:mt-0"
    >
      Add a Client
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  <ClientForm
    edit={undefined}
    formState="create"
    closePanel={() => (isFormVisible = false)}
  />
</SlidePanel>
