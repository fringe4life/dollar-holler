<script lang="ts">
  import type { Maybe } from "$lib/types";
  import { states } from "$lib/utils/states";
  import Select from "./ui/select/Select.svelte";

  interface Props {
    value: Maybe<string>;
  }

  let { value = $bindable() }: Props = $props();
</script>

<Select name="state" id="state" bind:value>
  {#each states as { value, name } (name)}
    <option {value}>{name}</option>
  {/each}
</Select>
