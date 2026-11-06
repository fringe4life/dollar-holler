<script lang="ts">
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
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
