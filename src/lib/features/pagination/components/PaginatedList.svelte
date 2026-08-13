<script generics="T extends CursorRow" lang="ts">
  import { cx } from "styled-system/css";
  import { flex, grid, stack } from "styled-system/patterns";
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { DEFAULT_LIMIT } from "../constants";
  import type { CursorRow, PaginationMetadata } from "../types";
  import { visibleListUrl } from "../utils/url";
  import Pagination from "./Pagination.svelte";
  import PaginationSkeleton from "./PaginationSkeleton.svelte";

  interface Props {
    blankState?: Snippet;
    class?: string;
    footer?: Snippet;
    header: Snippet;
    items: T[];
    noResults?: Snippet;
    paginationMetadata: PaginationMetadata;
    pending?: boolean;
    row: Snippet<[T]>;
    skeleton: Snippet;
    skeletonCount?: number;
  }

  let {
    items,
    paginationMetadata,
    pending = false,
    skeletonCount = DEFAULT_LIMIT,
    class: extraClass,
    header,
    skeleton,
    row,
    blankState,
    noResults,
    footer,
  }: Props = $props();

  const searchQuery = $derived(
    visibleListUrl(page).searchParams.get("q") ?? ""
  );
  const isBlank = $derived(!pending && items.length === 0 && !searchQuery);
  const isNoResults = $derived(
    !pending && items.length === 0 && Boolean(searchQuery)
  );
</script>

<div class={stack({ flexGrow: 1 })}>
  {#if isBlank}
    {@render blankState?.()}
  {:else if isNoResults}
    {@render noResults?.()}
  {:else}
    <div
      class={cx(
        grid({
          gridTemplateRows: {
            base: "1fr min-content",
            lg: "min-content 1fr min-content",
          },
          alignItems: "start",
          rowGap: 4,
          minBlockSize: "full",
        }),
        extraClass
      )}
    >
      {@render header()}
      <div
        class={flex({
          direction: "column-reverse",
          justify: "flex-end",
          gap: { base: 10, sm: 4 },
          blockSize: "full",
        })}
        style:view-transition-name="paginated-list-rows"
      >
        {#if pending}
          {#each { length: skeletonCount } as _, i (i)}
            {@render skeleton()}
          {/each}
        {:else}
          {#each items as item (item.id)}
            {@render row(item)}
          {/each}
        {/if}
      </div>
      {#if pending}
        <PaginationSkeleton />
      {:else}
        <Pagination {items} {paginationMetadata} {pending} />
        {@render footer?.()}
      {/if}
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
