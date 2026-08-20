<script lang="ts">
  import { flex, grid, gridItem } from "#styled-system/patterns/index.js";
  import { getToast } from "#lib/components/patterns/toast/toaster.svelte.ts";
  import {
    deleteClient,
    saveClient,
  } from "#features/clients/clients.remote.ts";
  import Form from "#lib/components/patterns/form/Form.svelte";
  import FormField from "#lib/components/patterns/form/FormField.svelte";
  import Check from "#lib/components/primitives/icons/Check.svelte";
  import Trash from "#lib/components/primitives/icons/Trash.svelte";
  import States from "#lib/components/patterns/States.svelte";
  import Button from "#lib/components/primitives/button/button.svelte";
  import LoaderButton from "#lib/components/primitives/button/LoaderButton.svelte";
  import Input from "#lib/components/primitives/input/Input.svelte";
  import { buttonIcon } from "#lib/styles.ts";
  import type { BitsButton } from "#lib/types.ts";
  import { getErrorMessage } from "#lib/utils/error-message.ts";
  import { zipInputAttrs } from "#lib/utils/zip.ts";
  import type { ClientSelect } from "../types";

  interface Panel {
    closePanel: () => void;
  }

  interface EditProps extends Panel {
    edit: ClientSelect;
    formState: "edit";
  }

  interface CreateProps extends Panel {
    edit?: undefined;
    formState: "create";
  }

  type ClientFormProps = CreateProps | EditProps;

  let { formState, closePanel, edit }: ClientFormProps = $props();
  const toast = getToast();

  const handleSaved = () => {
    toast.success(
      formState === "edit"
        ? "Client updated successfully"
        : "Client created successfully"
    );
    closePanel();
  };

  const handleDelete: BitsButton = async () => {
    if (formState === "edit" && edit) {
      try {
        await deleteClient({ id: edit.id });
        toast.success("Client deleted successfully");
        closePanel();
      } catch (error) {
        toast.error(getErrorMessage(error, "Failed to delete client"));
      }
    }
  };
</script>

<Form onSuccess={handleSaved} remote={saveClient}>
  {#if edit}
    <input {...saveClient.fields.id.as("hidden", edit.id)} />
  {/if}
  <div class={grid({ columns: 6, columnGap: 5 })}>
    <FormField
      class={gridItem({ colSpan: 6 })}
      forId="name"
      issues={saveClient.fields.name.issues()}
      label="Client Name"
    >
      {#snippet children({ errorId })}
        <Input
          id="name"
          required
          aria-describedby={errorId}
          {...saveClient.fields.name.as("text", edit?.name ?? "")}
        />
      {/snippet}
    </FormField>

    <FormField
      class={gridItem({ colSpan: 6 })}
      forId="email"
      issues={saveClient.fields.email.issues()}
      label="Client Email"
    >
      {#snippet children({ errorId })}
        <Input
          id="email"
          required
          aria-describedby={errorId}
          {...saveClient.fields.email.as("email", edit?.email ?? "")}
        />
      {/snippet}
    </FormField>

    <FormField
      class={gridItem({ colSpan: 6 })}
      forId="street"
      issues={saveClient.fields.street.issues()}
      label="Address"
    >
      {#snippet children({ errorId })}
        <Input
          id="street"
          aria-describedby={errorId}
          {...saveClient.fields.street.as("text", edit?.street ?? "")}
        />
      {/snippet}
    </FormField>

    <FormField
      class={gridItem({ colSpan: { base: 6, sm: 2 } })}
      forId="city"
      issues={saveClient.fields.city.issues()}
      label="City"
    >
      {#snippet children({ errorId })}
        <Input
          id="city"
          aria-describedby={errorId}
          {...saveClient.fields.city.as("text", edit?.city ?? "")}
        />
      {/snippet}
    </FormField>

    <FormField
      class={gridItem({ colSpan: { base: 6, sm: 2 } })}
      forId="state"
      issues={saveClient.fields.state.issues()}
      label="State"
    >
      {#snippet children({ errorId })}
        <States
          aria-describedby={errorId}
          {...saveClient.fields.state.as("text", edit?.state ?? "")}
        />
      {/snippet}
    </FormField>

    <FormField
      class={gridItem({ colSpan: { base: 6, sm: 2 } })}
      forId="zip"
      issues={saveClient.fields.zip.issues()}
      label="Zip"
    >
      {#snippet children({ errorId })}
        <Input
          id="zip"
          aria-describedby={errorId}
          {...zipInputAttrs}
          {...saveClient.fields.zip.as("text", edit?.zip ?? "")}
        />
      {/snippet}
    </FormField>
  </div>
  {#snippet submit({ pending })}
    <div
      class={flex({
        alignItems: "center",
        justifyContent: "space-between",
        gap: 5,
        marginBlockStart: 5,
      })}
    >
      {#if formState === "edit" && edit}
        <Button onclick={handleDelete} variant="textOnlyDestructive"
          ><Trash />
          Delete</Button
        >
      {:else}
        <span></span>
      {/if}
      <div class={flex({ gap: 5 })}>
        <Button onclick={() => closePanel()} variant="secondary">Cancel</Button>
        <LoaderButton class="group" {pending}
          ><Check class={buttonIcon("check")} /> Submit</LoaderButton
        >
      </div>
    </div>
  {/snippet}
</Form>
