<script lang="ts">
  import type { Snippet } from "svelte";

  export type EmptyStateHeaderSnippet = Snippet<[string, boolean]>;

  type TableHeaderProps = {
    headers: readonly string[];
    className?: string;
    emptyState?: boolean;
    headerSnippet: EmptyStateHeaderSnippet;
  };

  export type HeaderProps = Pick<TableHeaderProps, "className" | "emptyState">;

  let {
    headers,
    className = "",
    emptyState = false,
    headerSnippet,
  }: TableHeaderProps = $props();
</script>

<div class={`hidden lg:grid ${className}`}>
  {#each headers as header (header)}
    {@render headerSnippet(header, emptyState)}
  {/each}
  <div></div>
  <div></div>
</div>
