<script lang="ts">
  import { css } from "styled-system/css";
  import type { Toggle } from "$lib/client/runes/Toggle.svelte";
  import type { Option } from "./AdditionalOptionsItem.svelte";
  import AdditionalOptionsItem from "./AdditionalOptionsItem.svelte";

  interface Props {
    additionalMenu: Toggle;
    options: Option[];
  }

  let { additionalMenu, options }: Props = $props();
</script>

<!-- "inset-s-0 inset-bs-4 rounded-lg bg-white shadow-lg" -->
{#if additionalMenu.isOn}
  <ul
    class={css({
      position: "absolute",
      insetInlineStart: 0,
      insetBlockStart: 4,
      rounded: "lg",
      bgColor: "white",
      shadow: "lg",
    })}
  >
    {#each options as option (option.label)}
      <AdditionalOptionsItem {option} />
    {/each}
  </ul>
{/if}
