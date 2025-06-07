<script lang="ts">
  import Search from '$lib/components/Search.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import { onMount } from 'svelte'
  import ClientRow from './ClientRow.svelte'
  import ClientRowHeader from './ClientRowHeader.svelte'
  import { clients, loadClients } from '$lib/stores/clientStore'
  onMount(() => {
    loadClients()
  })
</script>

<svelte:head>
  <title>Client Page | Doller Holla</title>
</svelte:head>

<div
  class="mb-7 flex flex-col-reverse items-start justify-between gap-y-6 px-5 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mb-16 lg:px-10 lg:py-3 lg:text-lg"
>
  <!-- search field -->
  <!-- {#if $invoices.length > 0} -->
  <Search />
  <!-- {:else} 
    <div></div>
  {/if} -->
  <!-- new invoice button -->
  <div class="z-1">
    <Button onclick={() => {}} size="lg">+ Client</Button>
  </div>
</div>

<!-- list of clients -->

<div>
  {#if !$clients}
    <p>Loading...</p>
  {:else if $clients.length === 0}
    Blank state
  {:else}
    <!-- client header row -->
    <ClientRowHeader />
    <!-- client rows -->
    <div class="flex flex-col-reverse">
      {#each $clients as client (client.id)}
        <ClientRow bind:client />
      {/each}
    </div>
  {/if}
</div>
