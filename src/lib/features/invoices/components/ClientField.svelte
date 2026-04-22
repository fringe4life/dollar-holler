<script lang="ts">
  import type { ClientInsert } from "$features/clients/types";
  import Button from "$lib/components/ui/button/button.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { NewInvoice } from "../types";

  let {
    invoice = $bindable(),
    isNewClient = $bindable(),
    newClient = $bindable(),
  }: {
    invoice: NewInvoice;
    isNewClient: boolean;
    newClient: ClientInsert;
  } = $props();

  const { clients: clientsStore } = getDashboardStores();
</script>

<div class="field col-span-6 md:col-span-4">
  {#if !isNewClient}
    <label for="client">Client</label>
    <div class="flex flex-wrap items-end gap-x-2 sm:flex-nowrap md:gap-x-5">
      <select
        id="client"
        name="client"
        required={!isNewClient}
        bind:value={invoice.clientId}
        class="mbe-2 sm:mbe-0"
      >
        {#each clientsStore.clientPickerOptions as { id, name } (id)}
          <option value={id}>{name}</option>
        {/each}
      </select>
      <p class="text-monsoon text-base leading-9 font-bold lg:leading-14">or</p>
      <Button
        variant="outline"
        onclick={() => {
          isNewClient = true;
          newClient.name = "";
          newClient.email = "";
        }}>+ Client</Button
      >
    </div>
  {:else}
    <label for="newClient">New Client</label>
    <div class="flex flex-wrap items-end gap-x-2 sm:flex-nowrap md:gap-x-5">
      <input
        class="mbe-2 sm:mbe-0"
        bind:value={newClient.name}
        type="text"
        name="newClient"
        required={isNewClient}
      />
      <Button
        variant="outline"
        size="sm"
        onclick={() => {
          isNewClient = false;
          newClient = clientsStore.newClient();
        }}>Existing Client</Button
      >
    </div>
  {/if}
</div>
