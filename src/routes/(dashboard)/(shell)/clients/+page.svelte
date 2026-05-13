<script lang="ts">
  import { css } from "styled-system/css";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import BlankState from "$features/clients/components/BlankState.svelte";
  import ClientForm from "$features/clients/components/ClientForm.svelte";
  import ClientRow from "$features/clients/components/ClientRow.svelte";
  import ClientRowHeader from "$features/clients/components/ClientRowHeader.svelte";
  import ClientRowSkeleton from "$features/clients/components/ClientRowSkeleton.svelte";
  import type {
    ClientListResponse,
    ClientSelect,
  } from "$features/clients/types";
  import ItemsHeader from "$features/pagination/components/ItemsHeader.svelte";
  import NoSearchResults from "$features/pagination/components/NoSearchResults.svelte";
  import PaginatedList from "$features/pagination/components/PaginatedList.svelte";
  import type { CursorPaginatedList } from "$features/pagination/types";
  import { listUrlKey } from "$features/pagination/utils/url";
  import { ItemPanel } from "$lib/client/runes/ItemPanel.svelte";
  import ConfirmDelete from "$lib/components/ConfirmDelete.svelte";
  import Modal from "$lib/components/Modal.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { CursorId } from "$lib/types";
  import type { PageData } from "./$types";

  let { data }: { data: PageData } = $props();

  const createForm = new ItemPanel<undefined>();
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

<svelte:head> <title>Clients | Dollar Holler</title> </svelte:head>

<ItemsHeader store={clientsStore} open={createForm.open.bind(null, undefined)}>
  {#snippet button()}
    + Client
  {/snippet}
</ItemsHeader>

<PaginatedList
  store={clientsStore}
  class={css({ gridTemplateRows: "1fr min-content" })}
>
  {#snippet header()}
    <ClientRowHeader />
  {/snippet}
  {#snippet skeleton()}
    <ClientRowSkeleton />
  {/snippet}
  {#snippet row(_client)}
    <ClientRow
      client={_client}
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

<Modal
  variant="panel"
  bind:dialogEl={createForm.dialogEl}
  onClose={createForm.close}
>
  {#snippet title()}
    <h2
      class={css({
        fontFamily: "sansserif",
        color: "daisyBush",
        marginBlockStart: { base: 9, lg: 0 },
        marginBlockEnd: 7,
        fontSize: "3xl",
        fontWeight: "bold",
      })}
    >
      Add a Client
    </h2>
  {/snippet}

  {#snippet description()}
    <h2 class={css({ srOnly: true })}>Create a new client</h2>
  {/snippet}

  <ClientForm
    edit={undefined}
    formState="create"
    closePanel={createForm.close}
  />
</Modal>
{#if editPanel.item}
  <Modal
    variant="panel"
    bind:dialogEl={editPanel.dialogEl}
    onClose={editPanel.close}
  >
    {#snippet title()}
      <h2
        class={css({
      fontFamily: "sansserif",
      color: "daisyBush",
      marginBlockEnd: 7,
      fontSize: "3xl",
      fontWeight: "bold",
    })}
      >
        Edit a Client
      </h2>
    {/snippet}

    {#snippet description()}
      <h2 class={css({ display: "none" })}>Edit a client</h2>
    {/snippet}

    <ClientForm
      formState="edit"
      edit={editPanel.item}
      closePanel={editPanel.close}
    />
  </Modal>
{/if}

<ConfirmDelete
  item={deleteModal.item}
  bind:dialogEl={deleteModal.dialogEl}
  titleText="Are you sure you want to delete this client?"
  onCancel={deleteModal.close}
  onDelete={async () => {
      if (!deleteModal?.item?.id) {
        return;
      }
      await clientsStore.deleteClient(deleteModal.item.id);
      deleteModal.close();
    }}
>
  {#snippet descriptionSnippet(_client)}
    This will delete Client:
    <span class={css({ color: "scarlet" })}>{_client?.name ?? "Unknown"}</span>
  {/snippet}
</ConfirmDelete>
