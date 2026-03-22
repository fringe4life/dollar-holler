<script lang="ts">
  import { page } from "$app/state";
  import { ItemPanel } from "$lib/attachments/ItemPanel.svelte";
  import { Toggle } from "$lib/attachments/Toggle.svelte";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import NoSearchResults from "$lib/components/NoSearchResults.svelte";
  import Search from "$lib/components/Search.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { ClientListResponse, ClientSelect } from "$lib/validators";
  import { onMount } from "svelte";
  import BlankState from "./BlankState.svelte";
  import ClientForm from "./ClientForm.svelte";
  import ClientRow from "./ClientRow.svelte";
  import ClientRowHeader from "./ClientRowHeader.svelte";
  import ClientRowSkeleton from "./ClientRowSkeleton.svelte";

  const createForm = new Toggle();
  const editPanel = new ItemPanel<ClientSelect>();
  const deleteModal = new ItemPanel<ClientListResponse>();
  const searchQuery = $derived(page.url.searchParams.get("q") ?? "");

  const { clients: clientsStore } = getDashboardStores();

  onMount(() => {
    const ac = new AbortController();
    void clientsStore.loadClients(searchQuery, { signal: ac.signal });
    return () => ac.abort();
  });

  const handleSearch = async (searchTerms: string) =>
    await clientsStore.loadClients(searchTerms);

  const handleActivate = async (clientId: string) =>
    await clientsStore.updateClientStatus(clientId, "active");

  const handleArchive = async (clientId: string) =>
    await clientsStore.updateClientStatus(clientId, "archive");
</script>

<svelte:head>
  <title>Clients | Dollar Holler</title>
</svelte:head>

<div
  class="mbe-7 flex flex-col-reverse items-start justify-between gap-y-6 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mbe-16 lg:py-3 lg:text-lg"
>
  <!-- search field -->
  <Search {handleSearch} value={searchQuery} />
  <!-- new client button -->
  <div class="z-1">
    <Button onclick={() => createForm.on()} size="lg">+ Client</Button>
  </div>
</div>

<!-- list of clients -->
<div>
  {#if clientsStore.loading}
    <ClientRowHeader />
    <div class="grid gap-4">
      <ClientRowSkeleton />
      <ClientRowSkeleton />
      <ClientRowSkeleton />
      <ClientRowSkeleton />
      <ClientRowSkeleton />
    </div>
  {:else if clientsStore.error}
    <div class="grid place-content-center py-8 block-full">
      <div class="text-red-500 text-lg">Error: {clientsStore.error}</div>
    </div>
  {:else if clientsStore.clients.length === 0 && !searchQuery}
    <BlankState />
  {:else if clientsStore.clients.length === 0 && searchQuery}
    <NoSearchResults>
      {#snippet header()}
        <ClientRowHeader emptyState={true} />
      {/snippet}
    </NoSearchResults>
  {:else}
    <div>
      <ClientRowHeader />
      <div class="flex flex-col-reverse gap-4">
        {#each clientsStore.clients as client (client.id)}
          <ClientRow
            {client}
            onEdit={editPanel.open}
            onDelete={deleteModal.open}
            onActivate={handleActivate}
            onArchive={handleArchive}
          />
        {/each}
      </div>
    </div>
  {/if}
</div>

<SlidePanel bind:open={createForm.isOn} buttonText="">
  {#snippet title()}
    <h2
      class="mbs-9 mbe-7 font-sansserif text-3xl font-bold text-daisyBush lg:mbs-0"
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
    closePanel={() => createForm.off()}
  />
</SlidePanel>

<SlidePanel bind:open={editPanel.toggle.isOn} buttonText="">
  {#snippet title()}
    <h2 class="mbe-7 font-sansserif text-3xl font-bold text-daisyBush">
      Edit a Client
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class="hidden">""</h2>
  {/snippet}

  {#if editPanel.item}
    <ClientForm
      formState="edit"
      edit={editPanel.item}
      closePanel={() => editPanel.close()}
    />
  {/if}
</SlidePanel>

{#if deleteModal.item}
  <ConfirmDelete
    item={deleteModal.item}
    bind:open={deleteModal.toggle.isOn}
    titleText="Are you sure you want to delete this client?"
    onCancel={() => deleteModal.close()}
    onDelete={async () => {
      if (!deleteModal?.item?.id) return;
      await clientsStore.deleteClient(deleteModal.item.id);
      deleteModal.close();
    }}
  >
    {#snippet descriptionSnippet(client)}
      This will delete Client: <span class="text-scarlet">{client.name}</span>
    {/snippet}
  </ConfirmDelete>
{/if}
