<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { gridItem } from "styled-system/patterns";
  import type { MouseEventHandler } from "svelte/elements";
  import { resolve } from "$app/paths";
  import AdditionalOptions from "$lib/components/additionaloptions/AdditionalOptions.svelte";
  import AdditionalOptionsButton from "$lib/components/additionaloptions/AdditionalOptionsButton.svelte";
  import type { Option } from "$lib/components/additionaloptions/AdditionalOptionsItem.svelte";
  import AdditionalOptionsList from "$lib/components/additionaloptions/AdditionalOptionsList.svelte";
  import Activate from "$lib/components/icons/Activate.svelte";
  import Archive from "$lib/components/icons/Archive.svelte";
  import Edit from "$lib/components/icons/Edit.svelte";
  import Trash from "$lib/components/icons/Trash.svelte";
  import View from "$lib/components/icons/View.svelte";
  import Swipeable from "$lib/components/Swipeable.svelte";
  import Badge from "$lib/components/ui/badge/badge.svelte";
  import {
    actionButton,
    clientRow,
    clientTable,
    tableRowBase,
    tableRowHover,
  } from "$lib/styles";
  import type { CursorId } from "$lib/types";
  import { centsToDollars } from "$lib/utils/moneyHelpers";
  import type { ClientListResponse } from "../types";

  interface Props {
    client: ClientListResponse;
    onActivate: (clientId: CursorId) => void;
    onArchive: (clientId: CursorId) => void;
    onDelete: (client: ClientListResponse) => void;
    onEdit: (client: ClientListResponse) => void;
  }

  let { client, onEdit, onDelete, onActivate, onArchive }: Props = $props();
  // EVENT HANDLERS
  const handleDelete: MouseEventHandler<HTMLButtonElement> = () =>
    onDelete(client);

  const handleEdit: MouseEventHandler<HTMLButtonElement> = () => onEdit(client);

  const handleActivation: MouseEventHandler<HTMLButtonElement> = () =>
    onActivate(client.id);

  const handleArchive: MouseEventHandler<HTMLButtonElement> = () =>
    onArchive(client.id);

  // DERIVED STATE
  const receivedDisplay = $derived(centsToDollars(client.received));
  const balanceDisplay = $derived(centsToDollars(client.balance));
  const resolved = $derived(resolve(`/clients/${client.id}`));

  // ADDITIONAL OPTIONS
  const CLIENT_OPTIONS = $derived([
    {
      label: "Edit",
      icon: Edit,
      onclick: handleEdit,
      disabled: false,
    },
    {
      label: "Delete",
      icon: Trash,
      onclick: handleDelete,
      disabled: false,
    },
    {
      label: "Active",
      icon: Activate,
      onclick: handleActivation,
      disabled: client.clientStatus === "active",
    },
    {
      label: "Archive",
      icon: Archive,
      onclick: handleArchive,
      disabled: client.clientStatus === "archive",
    },
  ] satisfies Option[]);
</script>

<Swipeable
  // "group/row  client-table client-row table-row-hover shadow-tableRow relative z-5 items-center rounded-lg bg-white py-3 lg:py-6"
  contentClass={cx(
    "group",
    clientTable,
    clientRow,
    tableRowHover,
    tableRowBase
  )}
  contentViewTransitionName={`client-${client.id}`}
>
  {#snippet content()}
    <div
      class={gridItem({
        justifySelf: { base: "end", lg: "start" },
        gridArea: "status",
      })}
    >
      <Badge
        class={css({ marginInlineStart: { base: "auto", md: 0 } })}
        variant="draft"
        size="small"
        >{client.clientStatus}</Badge
      >
    </div>
    <div
      class={gridItem({
        gridArea: "clientName",
        truncate: true,
        fontSize: { lg: "xl" },
        fontWeight: "bold",
      })}
    >
      {client.name}
    </div>
    <div
      class={gridItem({
            gridArea: "received",
            _before: { content: "'Received: ' / 'your received money is'"}, 
            display: { base: "block", lg: "none" } ,
            textAlign: { base: "left", lg: "right" },
            fontSize: { base: "sm", lg: "lg" },
            fontWeight: "bold",
        })}
    >
      {receivedDisplay}
    </div>
    <div
      class={gridItem({
        gridArea: "balance",
        justifySelf: "end",
        _before: { content: "'Balance: ' / 'your balance is'" }, 
        display: { base: "block", lg: "none" },
        textAlign: { base: "left", lg: "right" },
        fontSize: { base: "sm", lg: "lg" },
        fontWeight: "bold",
        color: "scarlet",
      })}
    >
      {balanceDisplay}
    </div>
    <div
      class={gridItem({
        display: { base: "none", lg: "block" },
        gridArea: "view",placeSelf: "center"})}
    >
      <a
        class={css({
          color:{ base:"pastelPurple", _hover: "daisyBush", _groupHover: "daisyBush/50"},
          transitionProperty: "colors",
          transitionDuration: "normal",
        })}
        href={resolved}
        ><View /></a
      >
    </div>
    <AdditionalOptions classes={gridItem({ gridArea: "threeDots" })}>
      {#snippet content(additionalMenu)}
        <AdditionalOptionsButton {additionalMenu} />
        <AdditionalOptionsList {additionalMenu} options={CLIENT_OPTIONS} />
      {/snippet}
    </AdditionalOptions>
  {/snippet}
  {#snippet revealed()}
    {#if client.clientStatus === "active"}
      <button onclick={handleArchive} type="button" class={actionButton}>
        <Archive width={32} height={32} />
        Archive
      </button>
    {/if}
    {#if client.clientStatus === "archive"}
      <button onclick={handleActivation} type="button" class={actionButton}>
        <Activate width={32} height={32} />
        Activate
      </button>
    {/if}
    <button onclick={handleDelete} type="button" class={actionButton}>
      <Trash width={32} height={32} />
      Delete
    </button>
    <a class={actionButton} href={resolved}><View height={32} width={32} /></a>
  {/snippet}
</Swipeable>
