<script lang="ts">
  import { cx } from "#styled-system/css/index.js";
  import type { MouseEventHandler } from "svelte/elements";
  import { resolve } from "$app/paths";
  import Swipeable from "#lib/components/patterns/swipeable/Swipeable.svelte";
  import Badge from "#lib/components/primitives/badge/badge.svelte";
  import Activate from "#lib/components/primitives/icons/Activate.svelte";
  import Archive from "#lib/components/primitives/icons/Archive.svelte";
  import Edit from "#lib/components/primitives/icons/Edit.svelte";
  import Trash from "#lib/components/primitives/icons/Trash.svelte";
  import View from "#lib/components/primitives/icons/View.svelte";
  import type { CursorId } from "#lib/schemas/cursor-id.ts";
  import {
    rowActionButton,
    rowActionDangerButton,
    rowSwipeTrigger,
    tableRowBase,
  } from "#lib/styles.ts";
  import { money } from "#lib/components/primitives/money/money.ts";
  import { centsToDollars } from "#lib/utils/moneyHelpers.ts";
  import {
    clientBalance,
    clientName,
    clientReceived,
    clientRow,
    clientStateSignal,
    clientStatus,
    clientSwipeHint,
    clientTable,
  } from "../styles";
  import type { ClientListResponse } from "../types";

  interface Props {
    client: ClientListResponse;
    onActivate: (clientId: CursorId) => void;
    onArchive: (clientId: CursorId) => void;
    onDelete: (client: ClientListResponse) => void;
    onEdit: (client: ClientListResponse) => void;
  }

  let { client, onEdit, onDelete, onActivate, onArchive }: Props = $props();

  const handleDelete: MouseEventHandler<HTMLButtonElement> = () =>
    onDelete(client);
  const handleEdit: MouseEventHandler<HTMLButtonElement> = () => onEdit(client);
  const handleActivation: MouseEventHandler<HTMLButtonElement> = () =>
    onActivate(client.id);
  const handleArchive: MouseEventHandler<HTMLButtonElement> = () =>
    onArchive(client.id);

  const receivedDisplay = $derived(centsToDollars(client.received));
  const balanceDisplay = $derived(centsToDollars(client.balance));
  const isActive = $derived(client.clientStatus === "active");
  const statusLabel = $derived(isActive ? "Active" : "Archived");
  const clientDetailPath = "/(dashboard)/clients/[id=uuid]" as const;
  const stateClass = $derived(
    clientStateSignal({ state: client.clientStatus })
  );
</script>

<Swipeable
  contentClass={cx(clientTable, clientRow, stateClass, tableRowBase)}
  contentViewTransitionName={`client-${client.id}`}
>
  {#snippet content(showActions: () => void, isRevealed: boolean)}
    <div class={clientName}>{client.name}</div>
    <div class={clientStatus}>
      <Badge size="small" variant={client.clientStatus}>{statusLabel}</Badge>
    </div>
    <div class={clientReceived}>
      <span>Received</span>
      <span class={money()}>{receivedDisplay}</span>
    </div>
    <div class={clientBalance}>
      <span>Balance</span>
      <span class={money()}>{balanceDisplay}</span>
    </div>
    <div class={clientSwipeHint}>
      <button
        aria-controls={`client-${client.id}-actions`}
        aria-expanded={isRevealed}
        aria-label={`Show actions for ${client.name}`}
        class={rowSwipeTrigger}
        onclick={showActions}
        type="button"
      >
        <span aria-hidden="true">←</span>
        Swipe
      </button>
      <span
        >{isActive
          ? "Archive · Delete · View"
          : "Activate · Delete · View"}</span
      >
    </div>
  {/snippet}

  {#snippet actions()}
    <button
      aria-label={`Edit ${client.name}`}
      class={rowActionButton}
      onclick={handleEdit}
      type="button"
    >
      <Edit height={16} width={16} />
      Edit
    </button>
    {#if isActive}
      <button
        aria-label={`Archive ${client.name}`}
        class={rowActionButton}
        onclick={handleArchive}
        type="button"
      >
        <Archive height={16} width={16} />
        Archive
      </button>
    {:else}
      <button
        aria-label={`Activate ${client.name}`}
        class={rowActionButton}
        onclick={handleActivation}
        type="button"
      >
        <Activate height={16} width={16} />
        Activate
      </button>
    {/if}
    <button
      aria-label={`Delete ${client.name}`}
      class={cx(rowActionButton, rowActionDangerButton)}
      onclick={handleDelete}
      type="button"
    >
      <Trash height={16} width={16} />
      Delete
    </button>
    <a
      aria-label={`View ${client.name}`}
      class={rowActionButton}
      href={resolve(clientDetailPath, { id: client.id })}
    >
      <View height={16} width={16} />
      View
    </a>
  {/snippet}

  {#snippet revealed()}
    <button class={rowActionButton} onclick={handleEdit} type="button">
      <Edit height={24} width={24} />
      Edit
    </button>
    {#if isActive}
      <button class={rowActionButton} onclick={handleArchive} type="button">
        <Archive height={24} width={24} />
        Archive
      </button>
    {:else}
      <button class={rowActionButton} onclick={handleActivation} type="button">
        <Activate height={24} width={24} />
        Activate
      </button>
    {/if}
    <button
      class={cx(rowActionButton, rowActionDangerButton)}
      onclick={handleDelete}
      type="button"
    >
      <Trash height={24} width={24} />
      Delete
    </button>
    <a
      class={rowActionButton}
      href={resolve(clientDetailPath, { id: client.id })}
    >
      <View height={24} width={24} />
      View
    </a>
  {/snippet}
</Swipeable>
