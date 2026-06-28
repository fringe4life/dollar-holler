<script lang="ts">
  import { cx } from "styled-system/css";
  import { flex, grid, gridItem } from "styled-system/patterns";
  import type { FormEventHandler } from "svelte/elements";
  import FormField from "$lib/components/FormField.svelte";
  import Check from "$lib/components/icons/Check.svelte";
  import Trash from "$lib/components/icons/Trash.svelte";
  import States from "$lib/components/States.svelte";
  import Button from "$lib/components/ui/button/button.svelte";
  import Input from "$lib/components/ui/input/Input.svelte";
  import { getDashboardStores } from "$lib/stores/dashboard-stores-context.svelte";
  import type { BitsButton } from "$lib/types";
  import type { ClientInsert, ClientSelect } from "../types";

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

  export type ClientFormProps = CreateProps | EditProps;

  let { formState, closePanel, edit = $bindable() }: ClientFormProps = $props();

  const { clients: clientsStore } = getDashboardStores();

  // Form data using NewClient type
  let client: ClientInsert = $state(clientsStore.newClient());

  // Initialize form data based on edit mode
  // svelte-ignore state_referenced_locally
  if (formState === "edit" && edit) {
    // Extract only the fields we need for the form
    const { createdAt, updatedAt, ...clientData } = edit;
    client = clientData;
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (formState === "edit" && edit) {
      const { id: _id, ...patch } = client;
      await clientsStore.updateClient(edit.id, patch);
    } else {
      await clientsStore.createClient(client);
    }
    closePanel();
  };

  const handleDelete: BitsButton = async () => {
    if (formState === "edit" && edit) {
      await clientsStore.deleteClient(edit.id);
    }
  };
</script>

<form class={grid({ columns: 6, columnGap: 5 })} onsubmit={handleSubmit}>
  <FormField class={gridItem({ colSpan: 6 })} forId="name" label="Client Name">
    <Input
      id="name"
      name="name"
      required
      type="text"
      bind:value={client.name}
    />
  </FormField>

  <FormField
    class={gridItem({ colSpan: 6 })}
    forId="email"
    label="Client Email"
  >
    <Input
      id="email"
      name="email"
      required
      type="text"
      bind:value={client.email}
    />
  </FormField>

  <FormField class={gridItem({ colSpan: 6 })} forId="street" label="Address">
    <Input id="street" name="street" type="text" bind:value={client.street} />
  </FormField>

  <FormField class={gridItem({ colSpan: 2 })} forId="city" label="City">
    <Input id="city" name="city" type="text" bind:value={client.city} />
  </FormField>

  <FormField class={gridItem({ colSpan: 2 })} forId="state" label="State">
    <States bind:value={client.state} />
  </FormField>

  <FormField class={gridItem({ colSpan: 2 })} forId="zip" label="Zip">
    <Input
      id="zip"
      minlength={4}
      name="zip"
      type="text"
      bind:value={client.zip}
    />
  </FormField>

  <FormField class={gridItem({ colSpan: 3 })}>
    <Button onclick={handleDelete} variant="textOnlyDestructive"
      ><Trash />
      Delete</Button
    >
  </FormField>
  <!-- "field col-span-3 flex justify-end gap-x-5" -->
  <FormField
    class={cx(gridItem({ colSpan: 3 }), flex({ justify: "end", gap: 5 }))}
  >
    <Button onclick={() => closePanel()} variant="secondary">Cancel</Button>
    <Button type="submit"><Check /> Submit</Button>
  </FormField>
</form>
