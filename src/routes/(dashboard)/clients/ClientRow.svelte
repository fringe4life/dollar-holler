<script lang="ts">
  import { resolve } from "$app/paths";
  import AdditionalOptions from "$lib/components/AdditionalOptions.svelte";
  import AdditionalOptionsButton from "$lib/components/additionaloptions/AdditionalOptionsButton.svelte";
  import type { Option } from "$lib/components/additionaloptions/AdditionalOptionsItem.svelte";
  import AdditionalOptionsList from "$lib/components/additionaloptions/AdditionalOptionsList.svelte";
  import Swipeable from "$lib/components/Swipeable.svelte";
  import { Badge } from "$lib/components/ui/badge";
  import Activate from "$lib/icon/Activate.svelte";
  import Archive from "$lib/icon/Archive.svelte";
  import Edit from "$lib/icon/Edit.svelte";
  import Trash from "$lib/icon/Trash.svelte";
  import View from "$lib/icon/View.svelte";
  import { centsToDollars } from "$lib/utils/moneyHelpers";
  import type { ClientListResponse } from "$lib/validators";
  import type { MouseEventHandler } from "svelte/elements";

  type Props = {
    client: ClientListResponse;
    onEdit: (client: ClientListResponse) => void;
    onDelete: (client: ClientListResponse) => void;
    onActivate: (clientId: string) => void;
    onArchive: (clientId: string) => void;
  };

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
  contentClass="client-table client-row table-row-hover shadow-tableRow relative z-5 items-center rounded-lg bg-white py-3 lg:py-6"
  contentViewTransitionName={`client-${client.id}`}
>
  {#snippet content()}
    <div class="status">{@render tag(client.clientStatus)}</div>
    <div
      class="clientName truncate text-base font-bold whitespace-nowrap lg:text-xl"
    >
      {client.name}
    </div>
    <div class="received text-right font-mono text-sm font-bold lg:text-lg">
      {receivedDisplay}
    </div>
    <div
      class="balance text-right font-mono text-sm font-bold text-scarlet lg:text-lg"
    >
      {balanceDisplay}
    </div>
    <div class="view relative hidden place-self-center lg:block">
      <a
        class="text-pastelPurple transition-colors duration-200 hover:text-daisyBush"
        href={resolved}><View /></a
      >
    </div>
    <AdditionalOptions>
      {#snippet content(additionalMenu)}
        <AdditionalOptionsButton {additionalMenu} />
        <AdditionalOptionsList {additionalMenu} options={CLIENT_OPTIONS} />
      {/snippet}
    </AdditionalOptions>
  {/snippet}
  {#snippet revealed()}
    {#if client.clientStatus === "active"}
      <button onclick={handleArchive} class="action-button">
        <Archive width={32} height={32} />
        Archive
      </button>
    {/if}
    {#if client.clientStatus === "archive"}
      <button onclick={handleActivation} class="action-button">
        <Activate width={32} height={32} />
        Activate
      </button>
    {/if}
    <button onclick={handleDelete} class="action-button">
      <Trash width={32} height={32} />
      Delete
    </button>
    <a class="action-button" href={resolved}><View height={32} width={32} /></a>
  {/snippet}
</Swipeable>

{#snippet tag(title: string | null)}
  {#if title}
    <Badge class="ms-auto" variant="draft" size="small">{title}</Badge>
  {:else}
    <Badge class="ms-auto" variant="late" size="small">Error</Badge>
  {/if}
{/snippet}

<style>
  @reference "#app.css";
  :global {
    .client-row {
      grid-template-areas:
        "clientName status"
        "received balance";

      @media screen and (width > 1024px) {
        grid-template-areas: "status clientName received balance view threeDots";
      }
    }
    .clientName {
      grid-area: clientName;
    }
    .status {
      grid-area: status;
    }
    .received {
      grid-area: received;
      @apply text-left lg:text-right;
      &::before {
        content: "Received: " / "your received money is";
        @apply block text-xs font-bold lg:hidden;
      }
    }
    .balance {
      grid-area: balance;
      @apply text-left lg:text-right;
      &::before {
        content: "Balance: " / "Your balance is";
        @apply block text-xs font-bold lg:hidden;
      }
    }
  }
</style>
