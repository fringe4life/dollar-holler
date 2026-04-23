<script lang="ts" generics="T extends CursorRow">
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

<div class="flex grow flex-col">
  {#if store.error}
    <div class="grid place-content-center py-8 block-full">
      <div class="text-lg text-red-500">Error: {store.error}</div>
    </div>
  {:else if isBlank}
    {@render blankState?.()}
  {:else if isNoResults}
    {@render noResults?.()}
  {:else}
    <div
      class="grid grid-rows-[1fr_min-content] items-start gap-y-4 min-block-full lg:grid-rows-[min-content_1fr_min-content] {extraClass ??
        ''}"
    >
      {@render header()}
      <div
        class="flex flex-col-reverse justify-end gap-4 block-full"
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
