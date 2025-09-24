<script lang="ts">
  import type { Snippet } from 'svelte';

  type TableHeaderProps = {
    headers: readonly string[];
    className?: string;
    emptyState?: boolean;
    headerSnippet: Snippet<[string, boolean]>;
  };

  export type HeaderProps = Pick<TableHeaderProps, "className" | "emptyState">

  let { 
    headers, 
    className = '', 
    emptyState = false, 
    headerSnippet 
  }: TableHeaderProps = $props();
</script>

<div class={`hidden lg:grid ${className}`}>
  {#each headers as header (header)}
      {@render headerSnippet(header, emptyState)}
  {/each}
  <div></div>
  <div></div>
</div>
