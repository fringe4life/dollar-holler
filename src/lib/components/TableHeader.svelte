<script lang="ts">
  import { css, cx } from "styled-system/css";
  import type { Snippet } from "svelte";

  export type EmptyStateHeaderSnippet = Snippet<[string, boolean]>;

  interface TableHeaderProps {
    className?: string;
    emptyState?: boolean;
    headerSnippet: EmptyStateHeaderSnippet;
    headers: readonly string[];
  }

  export type HeaderProps = Pick<TableHeaderProps, "className" | "emptyState">;

  let {
    headers,
    className = "",
    emptyState = false,
    headerSnippet,
  }: TableHeaderProps = $props();
</script>
<div
  class={cx(
    css({
      display: { base: "none", lg: "grid" },
    }),
    className,
  )}
>
  {#each headers as header (header)}
    {@render headerSnippet(header, emptyState)}
  {/each}
  <div></div>
  <div></div>
</div>
