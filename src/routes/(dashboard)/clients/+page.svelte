<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { page } from "$app/state";
  import BoundaryError from "#lib/components/BoundaryError.svelte";
  import BlankState from "#features/clients/components/BlankState.svelte";
  import ClientForm from "#features/clients/components/ClientForm.svelte";
  import ClientRow from "#features/clients/components/ClientRow.svelte";
  import ClientRowHeader from "#features/clients/components/ClientRowHeader.svelte";
  import ClientRowSkeleton from "#features/clients/components/ClientRowSkeleton.svelte";
  import {
    deleteClient,
    listClients,
    updateClientStatus,
  } from "#features/clients/clients.remote.ts";
  import type {
    ClientListResponse,
    ClientSelect,
  } from "#features/clients/types.ts";
  import ItemsHeader from "#features/pagination/components/ItemsHeader.svelte";
  import NoSearchResults from "#features/pagination/components/NoSearchResults.svelte";
  import PaginatedList from "#features/pagination/components/PaginatedList.svelte";
  import PaginatedListSkeleton from "#features/pagination/components/PaginatedListSkeleton.svelte";
  import { normalizeListQueryFromUrl } from "#features/pagination/utils/list-query.ts";
  import { omitListItem } from "#features/pagination/utils/omit-list-item.ts";
  import { visibleListUrl } from "#features/pagination/utils/url.ts";
  import { ItemPanel } from "#lib/client/runes/ItemPanel.svelte.ts";
  import ConfirmDelete from "#lib/components/ConfirmDelete.svelte";
  import Modal from "#lib/components/Modal.svelte";
  import type { CursorId } from "#lib/types.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";
  import { toast } from "#lib/utils/toast.svelte.ts";

  const listArg = $derived(
    normalizeListQueryFromUrl(visibleListUrl(page)).normalized
  );
  const list = $derived(await listClients(listArg));

  const createForm = new ItemPanel<undefined>();
  const editPanel = new ItemPanel<ClientSelect>();
  const deleteModal = new ItemPanel<ClientListResponse>();

  const setClientStatus = async (
    clientId: CursorId,
    clientStatus: ClientListResponse["clientStatus"]
  ) => {
    try {
      await updateClientStatus({
        clientStatus,
        id: clientId,
      }).updates(
        listClients(listArg).withOverride((current) => ({
          ...current,
          items: current.items.map((client) =>
            client.id === clientId ? { ...client, clientStatus } : client
          ),
        }))
      );
      toast.success("Client updated successfully");
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to update client status"));
    }
  };

  const handleActivate = (clientId: CursorId) =>
    setClientStatus(clientId, "active");

  const handleArchive = (clientId: CursorId) =>
    setClientStatus(clientId, "archive");
</script>

<svelte:head>
  <title>Clients | Dollar Holler</title>
  <meta
    content="Browse, search, and manage client records in Dollar Holler."
    name="description"
  />
</svelte:head>

<ItemsHeader open={createForm.open.bind(null, undefined)}>
  {#snippet button()}
    + Client
  {/snippet}
</ItemsHeader>

<svelte:boundary>
  {#snippet pending()}
    <PaginatedListSkeleton>
      {#snippet header()}
        <ClientRowHeader />
      {/snippet}
      {#snippet skeleton()}
        <ClientRowSkeleton />
      {/snippet}
    </PaginatedListSkeleton>
  {/snippet}
  {#snippet failed(err, reset)}
    <BoundaryError
      error={err}
      fallbackMessage="Failed to load clients"
      onRetry={reset}
      title="We couldn’t load your clients"
    />
  {/snippet}

  <PaginatedList
    items={list.items}
    paginationMetadata={list.paginationMetadata}
  >
    {#snippet header()}
      <ClientRowHeader />
    {/snippet}
    {#snippet row(_client)}
      <ClientRow
        client={_client}
        onActivate={handleActivate}
        onArchive={handleArchive}
        onDelete={deleteModal.open}
        onEdit={editPanel.open}
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
</svelte:boundary>

<Modal onClose={createForm.close} variant="panel" {@attach createForm.attach}>
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
    closePanel={createForm.close}
    edit={undefined}
    formState="create"
  />
</Modal>

<Modal onClose={editPanel.close} variant="panel" {@attach editPanel.attach}>
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
  {#if editPanel.item}
    <ClientForm
      closePanel={editPanel.close}
      edit={editPanel.item}
      formState="edit"
    />
  {/if}
</Modal>

<ConfirmDelete
  item={deleteModal.item}
  onCancel={deleteModal.close}
  onDelete={async () => {
    const item = deleteModal.item;
    if (!item?.id) {
      return;
    }
    try {
      await deleteClient({ id: item.id }).updates(
        listClients(listArg).withOverride((current) =>
          omitListItem(current, item.id)
        )
      );
      toast.success("Client deleted successfully");
      deleteModal.close();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete client"));
    }
  }}
  titleText="Are you sure you want to delete this client?"
  {@attach deleteModal.attach}
>
  {#snippet descriptionSnippet(_client)}
    This will delete Client:
    <span class={css({ color: "scarlet" })}>{_client?.name ?? "Unknown"}</span>
  {/snippet}
</ConfirmDelete>
