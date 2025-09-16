<script lang="ts">
  import Button from '$lib/components/ui/button/button.svelte'
  import type { Client } from '$lib/db/schema'
  import Check from '$lib/icon/Check.svelte'
  import Trash from '$lib/icon/Trash.svelte'
  import { addClient, loadClients, updateClient } from '$lib/stores/clientStore.svelte'
  import { states } from '$lib/utils/states'
  import { onMount } from 'svelte'
  import type { FormEventHandler } from 'svelte/elements'
  type Panel = {
    closePanel: () => void
  }

  type EditProps = {
    edit: Client
    formState: 'edit'
  } & Panel

  type CreateProps = {
    formState: 'create'
    edit: undefined
  } & Panel

  export type Props = CreateProps | EditProps

  let { formState, closePanel, edit = $bindable() }: Props = $props()

  onMount(() => {
    loadClients()
  })

  let client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> = $state({
    city: '',
    email: '',
    name: '',
    state: '',
    street: '',
    zip: '',
    clientStatus: 'active'
  })

  if (edit) {
    client = edit
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = async e => {
    e.preventDefault()

    if (formState === 'create') {
      await addClient({ ...client })
      closePanel()
    } else if (formState === 'edit' && edit && edit.id) {
      await updateClient({ ...client, id: edit.id })
      closePanel()
    }
  }
</script>

<form class="grid grid-cols-6 gap-x-5" onsubmit={handleSubmit}>
  <div class="field col-span-full">
    <label for="name">Client Name</label>
    <input type="text" name="name" id="name" bind:value={client.name} required />
  </div>

  <div class="field col-span-full">
    <label for="email">Client Email</label>
    <input type="text" name="email" id="email" bind:value={client.email} required />
  </div>

  <div class="field col-span-full">
    <label for="street">Address</label>
    <input type="text" name="street" id="street" bind:value={client.street} />
  </div>

  <div class="field col-span-2">
    <label for="city">City</label>
    <input type="text" name="city" id="city" bind:value={client.city} />
  </div>

  <div class="field col-span-2">
    <label for="state">State</label>
    <select name="state" id="state" bind:value={client.state}>
      {#each states as state (state.name)}
        {@render State(state)}
      {/each}
    </select>
  </div>

  <div class="field col-span-2">
    <label for="zip">Zip</label>
    <input type="text" name="zip" id="zip" minlength="4" bind:value={client.zip} />
  </div>

  <div class="field col-span-3">
    <Button variant="textOnlyDestructive" onclick={() => {}}><Trash />{' '}Delete</Button>
  </div>

  <div class="field col-span-3 flex justify-end gap-x-5">
    <Button variant="secondary" onclick={() => closePanel()}>Cancel</Button>
    <Button type="submit"><Check />{' '}Submit</Button>
  </div>
</form>

{#snippet State({ value, name }: (typeof states)[number])}
  <option {value}>{name}</option>
{/snippet}
