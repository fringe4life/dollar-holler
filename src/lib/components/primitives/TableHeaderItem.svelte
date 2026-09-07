<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { Snippet } from "svelte";

  const tableHeaderItemClass = css({
    fontSize: "xl",
    fontWeight: "bold",
    lineHeight: "snug",
  });
  const emptyColor = css({ color: "pastelPurple" });
  const filledColor = css({ color: "daisyBush" });

  interface TableHeaderItemProps {
    children: Snippet;
    class?: string;
    emptyState?: boolean;
  }

  let {
    class: className = "",
    emptyState = false,
    children,
  }: TableHeaderItemProps = $props();
</script>

<h3
  class={cx(
    tableHeaderItemClass,
    emptyState ? emptyColor : filledColor,
    className
  )}
>
  {@render children()}
</h3>
