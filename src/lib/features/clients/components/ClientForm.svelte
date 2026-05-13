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
  <FormField label="Client Name" forId="name" class={gridItem({ colSpan: 6 })}>
    <Input
      type="text"
      name="name"
      id="name"
      bind:value={client.name}
      required
    />
  </FormField>

  <FormField
    label="Client Email"
    forId="email"
    class={gridItem({ colSpan: 6 })}
  >
    <Input
      type="text"
      name="email"
      id="email"
      bind:value={client.email}
      required
    />
  </FormField>

  <FormField label="Address" forId="street" class={gridItem({ colSpan: 6 })}>
    <Input type="text" name="street" id="street" bind:value={client.street} />
  </FormField>

  <FormField label="City" forId="city" class={gridItem({ colSpan: 2 })}>
    <Input type="text" name="city" id="city" bind:value={client.city} />
  </FormField>

  <FormField label="State" forId="state" class={gridItem({ colSpan: 2 })}>
    <States bind:value={client.state} />
  </FormField>

  <FormField label="Zip" forId="zip" class={gridItem({ colSpan: 2 })}>
    <Input
      type="text"
      name="zip"
      id="zip"
      minlength={4}
      bind:value={client.zip}
    />
  </FormField>

  <FormField class={gridItem({ colSpan: 3 })}>
    <Button variant="textOnlyDestructive" onclick={handleDelete}
      ><Trash />
      Delete</Button
    >
  </FormField>
  <!-- "field col-span-3 flex justify-end gap-x-5" -->
  <FormField
    class={cx(gridItem({ colSpan: 3 }), flex({ justify: "end", gap: 5 }))}
  >
    <Button variant="secondary" onclick={() => closePanel()}>Cancel</Button>
    <Button type="submit"><Check /> Submit</Button>
  </FormField>
</form>
