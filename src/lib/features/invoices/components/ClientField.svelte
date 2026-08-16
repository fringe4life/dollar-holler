<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { flex, gridItem } from "#styled-system/patterns/index.js";
  import type {
    ClientInsert,
    ClientPickerOption,
  } from "#features/clients/types.ts";
  import { supportsBaseSelect } from "#lib/client/supports.ts";
  import FormField from "#lib/components/FormField.svelte";
  import InitialsAvatar from "#lib/components/ui/avatar/InitialsAvatar.svelte";
  import Button from "#lib/components/ui/button/button.svelte";
  import Input from "#lib/components/ui/input/Input.svelte";
  import Label from "#lib/components/ui/label/Label.svelte";
  import Select from "#lib/components/ui/select/Select.svelte";
  import { newClient as blankClient } from "#features/clients/utils/new-client.ts";
  import type { NewInvoice } from "../types";

  interface ClientFieldProps {
    clientOptions: ClientPickerOption[];
    invoice: NewInvoice;
    isNewClient: boolean;
    newClient: ClientInsert;
  }

  let {
    clientOptions,
    invoice = $bindable(),
    isNewClient = $bindable(),
    newClient = $bindable(),
  }: ClientFieldProps = $props();
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
        class={css({ marginBlockEnd: { base: 2, sm: 0 } })}
        id="client"
        name="client"
        required={!isNewClient}
        bind:value={invoice.clientId}
      >
        {#each clientOptions as { id, name } (id)}
          <option
            onclick={() => {
              invoice.clientId = id;
            }}
            value={id}
          >
            {#if supportsBaseSelect}
              <!-- Clients have no photos yet; default to an initials avatar -->
              <InitialsAvatar {name} />
            {/if}
            {name}
          </option>
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
        onclick={() => {
          isNewClient = true;
          newClient.name = "";
          newClient.email = "";
        }}
        size="sm"
        variant="outline">+ Client</Button
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
        name="newClient"
        required={isNewClient}
        type="text"
        bind:value={newClient.name}
      />
      <Button
        onclick={() => {
          isNewClient = false;
          newClient = blankClient();
        }}
        size="sm"
        variant="outline">Existing Client</Button
      >
    </div>
  {/if}
</FormField>
