<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import NoSearchResults from "$lib/components/NoSearchResults.svelte";
  import Search from "$lib/components/Search.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import BlankState from "$lib/features/clients/components/BlankState.svelte";
  import ClientForm from "$lib/features/clients/components/ClientForm.svelte";
  import ClientRow from "$lib/features/clients/components/ClientRow.svelte";
  import ClientRowHeader from "$lib/features/clients/components/ClientRowHeader.svelte";
  import ClientRowSkeleton from "$lib/features/clients/components/ClientRowSkeleton.svelte";
  import type {
    ClientListResponse,
    ClientSelect,
  } from "$lib/features/clients/types";
  import Pagination from "$lib/features/pagination/components/Pagination.svelte";
  import type { CursorPaginatedList } from "$lib/features/pagination/types";
  import { listUrlKey } from "$lib/features/pagination/utils/url";
  import { ItemPanel } from "$lib/runes/ItemPanel.svelte";
  import { Toggle } from "$lib/runes/Toggle.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { CursorId } from "$lib/types";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const searchQuery = $derived(page.url.searchParams.get("q") ?? "");

  const createForm = new Toggle();
  const editPanel = new ItemPanel<ClientSelect>();
  const deleteModal = new ItemPanel<ClientListResponse>();

  const { clients: clientsStore } = getDashboardStores();
  // this is to prevent the loading state from being false when the page is loaded
  clientsStore.loading = true;
  const currentData = $derived({
    items: data.items,
    paginationMetadata: data.paginationMetadata,
  } satisfies CursorPaginatedList<ClientListResponse>);
  /** Re-sync store when `page.url` / `data` change after navigation (e.g. browser back). */
  afterNavigate(() => {
    clientsStore.hydrateFromLoad(currentData, listUrlKey(page.url));
  });

  const handleActivate = async (clientId: CursorId) =>
    await clientsStore.updateClientStatus(clientId, "active");

  const handleArchive = async (clientId: CursorId) =>
    await clientsStore.updateClientStatus(clientId, "archive");
</script>

<svelte:head>
  <title>Clients | Dollar Holler</title>
</svelte:head>

<div
  class="mbe-7 flex flex-col-reverse items-start justify-between gap-y-6 py-2 text-base md:flex-row md:items-center md:gap-y-4 lg:mbe-16 lg:py-3 lg:text-lg"
>
  <Search store={clientsStore} />
  <div class="z-1">
    <Button onclick={createForm.toggle} size="lg">+ Client</Button>
  </div>
</div>

<div class="flex grow flex-col">
  {#if clientsStore.loading}
    <ClientRowHeader />
    <div class="flex flex-col-reverse gap-4">
      <ClientRowSkeleton />
      <ClientRowSkeleton />
      <ClientRowSkeleton />
      <ClientRowSkeleton />
      <ClientRowSkeleton />
    </div>
  {:else if clientsStore.error}
    <div class="grid place-content-center py-8 block-full">
      <div class="text-lg text-red-500">Error: {clientsStore.error}</div>
    </div>
  {:else if clientsStore.items.length === 0 && !searchQuery}
    <BlankState />
  {:else if clientsStore.items.length === 0 && searchQuery}
    <NoSearchResults>
      {#snippet header()}
        <ClientRowHeader emptyState={true} />
      {/snippet}
    </NoSearchResults>
  {:else}
    <div
      class="grid min-h-full grid-rows-[1fr_min-content] items-start gap-y-4 lg:grid-rows-[min-content_1fr_min-content]"
    >
      <ClientRowHeader />
      <div class="flex h-full flex-col-reverse justify-end gap-4">
        {#each clientsStore.items as client (client.id)}
          <ClientRow
            {client}
            onEdit={editPanel.open}
            onDelete={deleteModal.open}
            onActivate={handleActivate}
            onArchive={handleArchive}
          />
        {/each}
      </div>
      <Pagination store={clientsStore} />
    </div>
  {/if}
</div>

<SlidePanel bind:open={createForm.isOn} buttonText="">
  {#snippet title()}
    <h2
      class="font-sansserif text-daisyBush mbs-9 mbe-7 text-3xl font-bold lg:mbs-0"
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
    <h2 class="font-sansserif text-daisyBush mbe-7 text-3xl font-bold">
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
    onCancel={deleteModal.close}
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
