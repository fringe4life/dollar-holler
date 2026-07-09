<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { Snippet } from "svelte";
  import { Toggle } from "$lib/client/runes/Toggle.svelte";

  interface Props {
    classes?: string;
    content: Snippet<[Toggle]>;
  }

  let { classes = "", content }: Props = $props();

  const additionalMenu = new Toggle();
</script>

<div
  class={cx(
    css({
      display: { base: "none", lg: "grid" },
      placeSelf: "center",
      position: "relative",
    }),
    classes
  )}
>
  {@render content(additionalMenu)}
</div>
