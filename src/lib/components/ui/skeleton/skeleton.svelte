<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { HTMLAttributes } from "svelte/elements";

  let {
    class: className,
    ...restProps
  }: HTMLAttributes<HTMLDivElement> & { class?: string } = $props();
</script>

<div
  data-slot="skeleton"
  aria-hidden="true"
  class={cx(
    css({ animation: "pulse", rounded: "md", backgroundColor: "gray.500" }),
    className,
  )}
  {...restProps}
></div>
