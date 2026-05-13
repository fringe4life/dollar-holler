<script lang="ts" generics="T extends CursorRow">
  import { css, cx } from "styled-system/css";
  import { flex, grid, gridItem, stack } from "styled-system/patterns";
  import type { Snippet } from "svelte";
  import { page } from "$app/state";
  import { DEFAULT_LIMIT } from "../constants";
  import type { CursorRow, PaginatableItems } from "../types";
  import Pagination from "./Pagination.svelte";
  import PaginationSkeleton from "./PaginationSkeleton.svelte";

  interface Props {
    blankState?: Snippet;
    class?: string;
    footer?: Snippet;
    header: Snippet;
    noResults?: Snippet;
    row: Snippet<[T]>;
    skeleton: Snippet;
    skeletonCount?: number;
    store: PaginatableItems<T>;
  }

  let {
    store,
    skeletonCount = DEFAULT_LIMIT,
    class: extraClass,
    header,
    skeleton,
    row,
    blankState,
    noResults,
    footer,
  }: Props = $props();

  const searchQuery = $derived(page.url.searchParams.get("q") ?? "");
  const isBlank = $derived(
    !store.loading && store.items.length === 0 && !searchQuery
  );
  const isNoResults = $derived(
    !store.loading && store.items.length === 0 && Boolean(searchQuery)
  );
</script>

<div class={stack({ flexGrow: 1 })}>
  {#if store.error}
    <div
      class={grid({
        placeContent: "center",
        paddingBlock: 8,
        blockSize: "full",
      })}
    >
      <div class={gridItem({ color: "scarlet", fontSize: "lg" })}>
        Error: {store.error}
      </div>
    </div>
  {:else if isBlank}
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
        extraClass,
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
        {#if store.loading}
          {#each { length: skeletonCount } as _, i (i)}
            {@render skeleton()}
          {/each}
        {:else}
          {#each store.items as item (item.id)}
            {@render row(item)}
          {/each}
        {/if}
      </div>
      {#if store.loading}
        <PaginationSkeleton />
      {:else}
        <Pagination {store} />
        {@render footer?.()}
      {/if}
    </div>
  {/if}
</div>
