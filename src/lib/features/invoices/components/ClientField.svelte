<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { flex, gridItem } from "#styled-system/patterns/index.js";
  import {
    type ClientInsert,
    type ClientPickerOption,
  } from "#features/clients/types.ts";
  import { newClient as blankClient } from "#features/clients/utils/new-client.ts";
  import { saveInvoice } from "#features/invoices/invoices.remote.ts";
  import { supportsBaseSelect } from "#lib/client/supports.ts";
  import FormField from "#lib/components/patterns/form/FormField.svelte";
  import InitialsAvatar from "#lib/components/primitives/avatar/InitialsAvatar.svelte";
  import Button from "#lib/components/primitives/button/button.svelte";
  import Input from "#lib/components/primitives/input/Input.svelte";
  import Select from "#lib/components/primitives/select/Select.svelte";
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

<FormField
  class={gridItem({ colSpan: { base: 6, md: 4 } })}
  forId={isNewClient ? "newClient" : "client"}
  issues={isNewClient
    ? saveInvoice.fields.name.issues()
    : saveInvoice.fields.clientId.issues()}
  label={isNewClient ? "New Client" : "Client"}
>
  {#snippet children({ errorId })}
    {#if !isNewClient}
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
          required={!isNewClient}
          aria-describedby={errorId}
          {...saveInvoice.fields.clientId.as("select", invoice.clientId ?? "")}
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
      <input
        {...saveInvoice.fields.isNewClient.as("checkbox")}
        checked
        hidden
      />
      <div
        class={flex({
          flexWrap: { base: "wrap", sm: "nowrap" },
          alignItems: "end",
          gap: { base: 2, md: 5 },
        })}
      >
        <Input
          class={css({ marginBlockEnd: { base: 2, sm: 0 } })}
          id="newClient"
          required={isNewClient}
          type="text"
          aria-describedby={errorId}
          {...saveInvoice.fields.name.as("text", newClient.name)}
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
  {/snippet}
</FormField>
