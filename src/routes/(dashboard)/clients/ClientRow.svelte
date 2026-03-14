<script lang="ts">
  import AdditionalOptions from "$lib/components/AdditionalOptions.svelte";
  import { Badge } from "$lib/components/ui/badge";

  import { resolve } from "$app/paths";
  import { clickOutside } from "$lib/attachments/clickOutside";
  import { swipe } from "$lib/attachments/swipe.svelte";
  import Activate from "$lib/icon/Activate.svelte";
  import Archive from "$lib/icon/Archive.svelte";
  import Cancel from "$lib/icon/Cancel.svelte";
  import Edit from "$lib/icon/Edit.svelte";
  import ThreeDots from "$lib/icon/ThreeDots.svelte";
  import Trash from "$lib/icon/Trash.svelte";
  import View from "$lib/icon/View.svelte";
  import { centsToDollars } from "$lib/utils/moneyHelpers";
  import type { ClientListResponse } from "$lib/validators";
  import type { MouseEventHandler } from "svelte/elements";
  import ConfirmClientDelete from "./ConfirmClientDelete.svelte";

  type Props = {
    client: ClientListResponse;
    onEdit: (client: ClientListResponse) => void;
    onActivate: (client: ClientListResponse) => void;
    onArchive: (client: ClientListResponse) => void;
  };

  let { client, onEdit, onActivate, onArchive }: Props = $props();

  let open = $state<boolean>(false);
  let isAdditionalMenuShowing = $state(false);
  let triggerReset = $state(false);

  const handleDelete: MouseEventHandler<HTMLButtonElement> = () => {
    open = true;
    isAdditionalMenuShowing = false;
  };

  const handleEdit: MouseEventHandler<HTMLButtonElement> = () => {
    onEdit(client);
    isAdditionalMenuShowing = false;
  };

  const handleMenu: MouseEventHandler<HTMLButtonElement> = () => {
    isAdditionalMenuShowing = !isAdditionalMenuShowing;
  };

  const handleActivation: MouseEventHandler<HTMLButtonElement> = () => {
    onActivate(client);
    isAdditionalMenuShowing = false;
  };

  const handleArchive: MouseEventHandler<HTMLButtonElement> = () => {
    onArchive(client);
    isAdditionalMenuShowing = false;
  };

  const closeOptions = () => {
    isAdditionalMenuShowing = false;
  };

  const receivedDisplay = $derived(centsToDollars(client.received));
  const balanceDisplay = $derived(centsToDollars(client.balance));
  const resolved = $derived(resolve(`/clients/${client.id}`));
</script>

<div class="relative isolate">
  <div
    {@attach swipe({ triggerReset: triggerReset })}
    class="client-table client-row shadow-tableRow relative z-5 items-center rounded-lg bg-white py-3 lg:py-6"
  >
    <div class="status">{@render tag(client.clientStatus as string)}</div>
    <div
      class="clientName truncate text-base font-bold whitespace-nowrap lg:text-xl"
    >
      {client.name}
    </div>
    <div class="received text-right font-mono text-sm font-bold lg:text-lg">
      {receivedDisplay}
    </div>
    <div
      class="text-scarlet balance text-right font-mono text-sm font-bold lg:text-lg"
    >
      {balanceDisplay}
    </div>
    <div class="view relative hidden place-self-center lg:block">
      <a
        class="text-pastelPurple hover:text-daisyBush transition-colors duration-200"
        href={resolved}><View /></a
      >
    </div>
    <div class="relative hidden place-self-center lg:grid">
      <button
        {@attach isAdditionalMenuShowing && clickOutside(closeOptions)}
        onclick={handleMenu}
        class="text-pastelPurple hover:text-daisyBush transition-colors duration-200"
        ><ThreeDots /></button
      >
      {#if isAdditionalMenuShowing}
        <AdditionalOptions
          options={[
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
          ]}
        />
      {/if}
    </div>
  </div>

  <!-- revealed on swipe -->
  <div class="swipe-revealed-actions">
    <button onclick={() => (triggerReset = true)} class="action-button">
      <Cancel width={32} height={32} />
      Cancel
    </button>
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
  </div>
</div>

{#snippet tag(title: string)}
  <Badge class="ml-auto" variant="draft" size="small">{title}</Badge>
{/snippet}

<ConfirmClientDelete bind:open {client} />

<style>
  @reference "../../../app.css";

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
</style>
