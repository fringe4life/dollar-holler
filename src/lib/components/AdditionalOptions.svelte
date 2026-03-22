<script lang="ts">
  import { Toggle } from "$lib/attachments/Toggle.svelte";
  import { type Snippet } from "svelte";
  type Props = {
    classes?: string;
    content: Snippet<[Toggle]>;
  };

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
