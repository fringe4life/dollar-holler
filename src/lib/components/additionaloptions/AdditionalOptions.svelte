<script lang="ts">
  import type { Snippet } from "svelte";
  import { Toggle } from "$lib/runes/Toggle.svelte";

  interface Props {
    classes?: string;
    content: Snippet<[Toggle]>;
  }

  let { classes = "", content }: Props = $props();

  const additionalMenu = new Toggle();
</script>

<div
  class={{
    "relative hidden place-self-center lg:grid": true,
    [classes]: classes,
  }}
>
  {@render content(additionalMenu)}
</div>
