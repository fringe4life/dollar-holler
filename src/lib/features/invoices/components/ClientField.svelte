<script lang="ts">
  import { css } from "styled-system/css";
  import { flex, gridItem } from "styled-system/patterns";
  import type { ClientInsert } from "$features/clients/types";
  import FormField from "$lib/components/FormField.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
  import Label from "$lib/components/ui/label/Label.svelte";
  import Select from "$lib/components/ui/select/Select.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { NewInvoice } from "../types";

  interface ClientFieldProps {
    invoice: NewInvoice;
    isNewClient: boolean;
    newClient: ClientInsert;
  }

  let {
    invoice = $bindable(),
    isNewClient = $bindable(),
    newClient = $bindable(),
  }: ClientFieldProps = $props();

  const { clients: clientsStore } = getDashboardStores();
</script>

<FormField class={gridItem({ colSpan: { base: 6, md: 4 } })}>
  {#if !isNewClient}
    <Label for="client">Client</Label>
    <div
      class={flex({
        flexWrap: { base: "wrap", sm: "nowrap" },
        alignItems: "center",
        gap: { base: 2, md: 5 },
      })}
    >
      <Select
        id="client"
        name="client"
        required={!isNewClient}
        bind:value={invoice.clientId}
        class={css({ marginBlockEnd: { base: 2, sm: 0 } })}
      >
        {#each clientsStore.clientPickerOptions as { id, name } (id)}
          <option value={id}>{name}</option>
        {/each}
      </Select>
      <p
        class={css({
          color: "monsoon",
          fontWeight: "bold",
        })}
      >
        or
      </p>
      <Button
        variant="outline"
        size="sm"
        onclick={() => {
          isNewClient = true;
          newClient.name = "";
          newClient.email = "";
        }}
        >+ Client</Button
      >
    </div>
  {:else}
    <Label for="newClient">New Client</Label>
    <div
      class={flex({
        flexWrap: { base: "wrap", sm: "nowrap" },
        alignItems: "end",
        gap: { base: 2, md: 5 },
      })}
    >
      <Input
        class={css({ marginBlockEnd: { base: 2, sm: 0 } })}
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
        }}
        >Existing Client</Button
      >
    </div>
  {/if}
</FormField>
