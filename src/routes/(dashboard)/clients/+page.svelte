<script lang="ts">
  import Search from '$lib/components/Search.svelte'
  import SlidePanel from '$lib/components/SlidePanel.svelte'
  import Button from '$lib/components/ui/button/button.svelte'
  import type { Client } from '$lib/db/schema'
  import { clientsStore, loadClients } from '$lib/stores/clientStore.svelte'
  import { onMount } from 'svelte'
  import NoSearchResults from '../invoices/NoSearchResults.svelte'
  import BlankState from './BlankState.svelte'
  import ClientForm from './ClientForm.svelte'
  import ClientRow from './ClientRow.svelte'
  import ClientRowHeader from './ClientRowHeader.svelte'

  let clientList: Client[] = $state([])
  let clients = $state(clientsStore.value)

  onMount(async () => {
    await loadClients()
    clients = clientsStore.value
    clientList = clients
  })

  let isFormVisible = $state<boolean>(false)

  const handleSearch = (searchTerms: string) => {
    console.log(searchTerms)
    clientList = clients.filter(client => {
      return (
        client.city?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client?.state?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client?.zip?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client?.email?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client?.street?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client?.clientStatus?.toLowerCase().includes(searchTerms.toLowerCase()) ||
        client.name.toLowerCase().includes(searchTerms.toLowerCase())
      )
    })
  }
</script>

<svelte:head>
  <title>Client Page | Doller Holla</title>
</svelte:head>

<div
  class="mb-7 flex flex-col-reverse items-start justify-between gap-y-6 px-5 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mb-16 lg:px-10 lg:py-3 lg:text-lg"
>
  <!-- search field -->
  {#if clients.length > 0}
    <Search {handleSearch} />
  {:else}
    <div></div>
  {/if}
  <!-- new invoice button -->
  <div class="z-1">
    <Button
      onclick={() => {
        isFormVisible = true
      }}
      size="lg">+ Client</Button
    >
  </div>
</div>

<!-- list of clients -->

<div>
  {#if !clients}
    <p>Loading...</p>
  {:else if clients.length === 0}
    <BlankState />
  {:else if clientList.length === 0}
    <NoSearchResults />
  {:else}
    <!-- client header row -->
    <ClientRowHeader />
    <!-- client rows -->
    <div class="flex flex-col-reverse">
      {#each clientList as client, index (client.id)}
        <ClientRow bind:client={clients[index]} />
      {/each}
    </div>
  {/if}
</div>

<SlidePanel bind:open={isFormVisible} buttonText="">
  {#snippet title()}
    <h2 class="font-sansserif text-daisyBush mt-9 mb-7 text-3xl font-bold lg:mt-0">
      Add an Client
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  <ClientForm edit={undefined} formState="create" closePanel={() => (isFormVisible = false)} />
</SlidePanel>
