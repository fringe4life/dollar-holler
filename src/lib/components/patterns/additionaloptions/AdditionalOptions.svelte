<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { Snippet } from "svelte";

  interface Props {
    classes?: string;
    children: Snippet;
  }

  let { classes = "", children }: Props = $props();
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
  {@render children()}
</div>
