<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { HTMLAttributes } from "svelte/elements";
  import { CORNER_SHAPE } from "#lib/styles.ts";

  let {
    class: className,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & { class?: string } = $props();
</script>

<div
  aria-hidden="true"
  class={cx(
    css({
      animation: "pulse",
      backgroundColor: "skeleton",
      cornerShape: CORNER_SHAPE,
      rounded: "md",
    }),
    className
  )}
  {...restProps}
></div>
