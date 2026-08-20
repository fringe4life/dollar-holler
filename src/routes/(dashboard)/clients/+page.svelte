<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { page } from "$app/state";
  import { getToast } from "#lib/components/ui/toast/toaster.svelte.ts";
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
  import { buttonIcon } from "#lib/styles.ts";
  import {
    ItemPanel,
    upsertKey,
    type UpsertTarget,
  } from "#lib/client/runes/ItemPanel.svelte.ts";
  import ConfirmDelete from "#lib/components/ConfirmDelete.svelte";
  import FormPanel from "#lib/components/form/FormPanel.svelte";
  import type { CursorId } from "#lib/schemas/cursor-id.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";

  const toast = getToast();
  const listArg = $derived(
    normalizeListQueryFromUrl(visibleListUrl(page)).normalized
  );
  const list = $derived(await listClients(listArg));

  const formPanel = new ItemPanel<UpsertTarget<ClientSelect>>();
  const deleteModal = new ItemPanel<ClientListResponse>();
  const formTarget = $derived(formPanel.item);
  const isEdit = $derived(formTarget?.kind === "edit");

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

<ItemsHeader open={() => formPanel.open({ kind: "create" })}>
  {#snippet button()}
    <span aria-hidden="true" class={buttonIcon("plus")}>+</span>
    Client
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
      title="We couldn't load your clients"
    />
  {/snippet}

  <PaginatedList
    items={list.items}
    paginationMetadata={list.paginationMetadata}
  >
    {#snippet header()}
      <ClientRowHeader />
    {/snippet}
    {#snippet row(client)}
      <ClientRow
        {client}
        onActivate={handleActivate}
        onArchive={handleArchive}
        onDelete={deleteModal.open}
        onEdit={(client) => formPanel.open({ kind: "edit", item: client })}
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

<FormPanel
  attach={formPanel.attach}
  descriptionText={isEdit ? "Edit a client" : "Create a new client"}
  onClose={formPanel.close}
  titleText={isEdit ? "Edit a Client" : "Add a Client"}
>
  {#if formTarget}
    {#key upsertKey(formTarget, (client) => client.id)}
      {#if formTarget.kind === "edit"}
        <ClientForm
          closePanel={formPanel.close}
          edit={formTarget.item}
          formState="edit"
        />
      {:else}
        <ClientForm
          closePanel={formPanel.close}
          edit={undefined}
          formState="create"
        />
      {/if}
    {/key}
  {/if}
</FormPanel>

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
  {#snippet descriptionSnippet(client)}
    This will delete Client:
    <span class={css({ color: "scarlet" })}>{client?.name ?? "Unknown"}</span>
  {/snippet}
</ConfirmDelete>
