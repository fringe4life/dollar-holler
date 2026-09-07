<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { Snippet } from "svelte";

  export type TableHeaderColumn = {
    class?: string;
    title: string;
  };

  export type EmptyStateHeaderSnippet = Snippet<[TableHeaderColumn]>;

  interface TableHeaderProps {
    className?: string;
    headerSnippet: EmptyStateHeaderSnippet;
    headers: readonly TableHeaderColumn[];
  }

  export type HeaderProps = Pick<TableHeaderProps, "className"> & {
    emptyState?: boolean;
  };

  let { headers, className = "", headerSnippet }: TableHeaderProps = $props();
</script>

<div
  class={cx(
    css({
      display: { base: "none", lg: "grid" },
    }),
    className
  )}
>
  {#each headers as header (header.title)}
    {@render headerSnippet(header)}
  {/each}
  <div></div>
  <div></div>
</div>
