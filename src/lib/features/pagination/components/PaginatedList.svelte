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
  import { visibleListUrl } from "../utils/url";
  import Pagination from "./Pagination.svelte";

  interface Props {
    blankState?: Snippet;
    class?: string;
    footer?: Snippet;
    header: Snippet;
    items: T[];
    noResults?: Snippet;
    paginationMetadata: PaginationMetadata;
    row: Snippet<[T]>;
  }

  let {
    items,
    paginationMetadata,
    class: extraClass,
    header,
    row,
    blankState,
    noResults,
    footer,
  }: Props = $props();

  const searchQuery = $derived(
    visibleListUrl(page).searchParams.get("q") ?? ""
  );
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
      {@render header()}
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

<style>
  /*
   * Typed pagination VT — viewTransition() has no types API.
   * Keyframes from theme (removeUnusedKeyframes: false in panda.config).
   */
  :global {
    :active-view-transition-type(forward) {
      &::view-transition-old(paginated-list-rows) {
        --slide-distance: -60px;

        animation:
          fade-out 250ms both,
          slide-out 250ms both;
      }

      &::view-transition-new(paginated-list-rows) {
        --slide-distance: calc(100vw + 60px);

        animation:
          fade-in 250ms both,
          slide-in 250ms both;
      }
    }

    :active-view-transition-type(backward) {
      &::view-transition-old(paginated-list-rows) {
        --slide-distance: calc(100vw + 60px);

        animation:
          fade-out 250ms both,
          slide-out 250ms both;
      }

      &::view-transition-new(paginated-list-rows) {
        --slide-distance: -60px;

        animation:
          fade-in 250ms both,
          slide-in 250ms both;
      }
    }
  }
</style>
