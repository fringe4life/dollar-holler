<script generics="T extends CursorRow" lang="ts">
  import { cx } from "#styled-system/css/index.js";
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import type { CursorRow, PaginationMetadata } from "../types";
  import {
    paginatedListGrid,
    paginatedListRows,
    paginatedListStack,
  } from "../styles";
  import { readListQuery } from "../utils/list-query";
  import Pagination from "./Pagination.svelte";

  interface Props {
    blankState?: Snippet;
    class?: string;
    footer?: Snippet;
    items: T[];
    noResults?: Snippet;
    paginationMetadata: PaginationMetadata;
    row: Snippet<[T]>;
  }

  let {
    items,
    paginationMetadata,
    class: extraClass,
    row,
    blankState,
    noResults,
    footer,
  }: Props = $props();

  const searchQuery = $derived(readListQuery(page).q ?? "");
  const isBlank = $derived(items.length === 0 && !searchQuery);
  const isNoResults = $derived(items.length === 0 && Boolean(searchQuery));
</script>

<div class={paginatedListStack}>
  {#if isBlank}
    {@render blankState?.()}
  {:else if isNoResults}
    {@render noResults?.()}
  {:else}
    <div class={cx(paginatedListGrid, extraClass)}>
      <div
        class={paginatedListRows}
        style:view-transition-name="paginated-list-rows"
      >
        {#each items as item (item.id)}
          {@render row(item)}
        {/each}
      </div>
      <Pagination {items} {paginationMetadata} />
      {@render footer?.()}
    </div>
  {/if}
</div>
