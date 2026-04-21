<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import NoSearchResults from "$lib/components/NoSearchResults.svelte";
  import ItemsHeader from "$lib/components/ItemsHeader.svelte";
  import SlidePanel from "$lib/components/SlidePanel.svelte";
  import BlankState from "$lib/features/clients/components/BlankState.svelte";
  import ClientForm from "$lib/features/clients/components/ClientForm.svelte";
  import ClientRow from "$lib/features/clients/components/ClientRow.svelte";
  import ClientRowHeader from "$lib/features/clients/components/ClientRowHeader.svelte";
  import ClientRowSkeleton from "$lib/features/clients/components/ClientRowSkeleton.svelte";
  import type {
    ClientListResponse,
    ClientSelect,
  } from "$lib/features/clients/types";
  import PaginatedList from "$lib/features/pagination/components/PaginatedList.svelte";
  import type { CursorPaginatedList } from "$lib/features/pagination/types";
  import { listUrlKey } from "$lib/features/pagination/utils/url";
  import { ItemPanel } from "$lib/runes/ItemPanel.svelte";
  import { Toggle } from "$lib/runes/Toggle.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { CursorId } from "$lib/types";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

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

<ItemsHeader store={clientsStore} toggle={createForm.toggle}>
  {#snippet button()}
    + Client
  {/snippet}
</ItemsHeader>

<PaginatedList store={clientsStore} class="grid-rows-[1fr_min-content]">
  {#snippet header()}
    <ClientRowHeader />
  {/snippet}
  {#snippet skeleton()}
    <ClientRowSkeleton />
  {/snippet}
  {#snippet row(client)}
    <ClientRow
      {client}
      onEdit={editPanel.open}
      onDelete={deleteModal.open}
      onActivate={handleActivate}
      onArchive={handleArchive}
    />
  {/snippet}
  {#snippet blankState()}
    <BlankState />
  {/snippet}
  {#snippet noResults()}
    <NoSearchResults>
      {#snippet header()}
        <ClientRowHeader emptyState={true} />
      {/snippet}
    </NoSearchResults>
  {/snippet}
</PaginatedList>

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
