<script lang="ts">
  import type { Toggle } from "$lib/attachments/Toggle.svelte";
  import type { Option } from "./AdditionalOptionsItem.svelte";
  import AdditionalOptionsItem from "./AdditionalOptionsItem.svelte";

  type Props = {
    additionalMenu: Toggle;
    options: Option[];
  };

  let { additionalMenu, options }: Props = $props();
</script>

{#if additionalMenu.isOn}
  <ul class="absolute top-4 left-0 rounded-lg bg-white shadow-lg">
    {#each options as option (option.label)}
      <AdditionalOptionsItem {option} />
    {/each}
  </ul>
{/if}
