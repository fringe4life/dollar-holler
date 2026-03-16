<script lang="ts">
  import type { Maybe } from "$lib/types";
  import { states } from "$lib/utils/states";

  type Props = {
    value: Maybe<string>;
  };

  let { value = $bindable() }: Props = $props();
</script>

<select name="state" id="state" bind:value>
  {#each states as state (state.name)}
    {@render State(state)}
  {/each}
</select>

{#snippet State({ value, name }: (typeof states)[number])}
  <option {value}>{name}</option>
{/snippet}
