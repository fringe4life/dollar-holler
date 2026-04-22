<script lang="ts" generics="T extends CursorRow">
  /**
   * Keyset pagination: changing `limit` resets cursor/direction (first page at new size).
   */
  import { pushState } from "$app/navigation";
  import { page } from "$app/state";
  import type {
    CursorRow,
    PaginatableItems,
    PaginationSearchParams,
  } from "$features/pagination/types";
  import {
    parseLimitParam,
    toNormalizedListQuery,
  } from "$features/pagination/utils/list-query";
  import { buildListSearchString } from "$features/pagination/utils/url";
  import { buttonVariants } from "$lib/components/ui/button/button.svelte";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { LIMITS } from "../constants";
  import type { ListDirection } from "../types";

  type Props = {
    store: PaginatableItems<T>;
  };

  let { store }: Props = $props();

  const searchQuery = $derived(page.url.searchParams.get("q") ?? "");
  const limitFromUrl = $derived(
    parseLimitParam(page.url.searchParams.get("limit"))
  );

  const rowItems = $derived(store.items);
  const pageMeta = $derived(store.paginationMetadata);

  const canNavigate = $derived(
    pageMeta.hasNextPage || pageMeta.hasPreviousPage
  );

  const navigateWithQuery = async (next: PaginationSearchParams) => {
    store.presetClientListQueryKey?.(next);
    pushState(`${page.url.pathname}${buildListSearchString(next)}`, {});
    await store.loadItems(next);
  };

  const navigateWithTransition = async (
    next: PaginationSearchParams,
    direction: ListDirection
  ) => {
    if (typeof document?.startViewTransition !== "function") {
      await navigateWithQuery(next);
      return;
    }

    try {
      await document.startViewTransition({
        types: [direction],
        update: () => navigateWithQuery(next),
      }).finished;
    } catch {
      await navigateWithQuery(next);
    }
  };
  const handleForward = async () => {
    const last = rowItems.at(-1);
    if (!last) {
      return;
    }
    const q = searchQuery || undefined;
    const next = toNormalizedListQuery(q, {
      cursor: last.id,
      direction: "forward",
      limit: limitFromUrl,
    });
    await navigateWithTransition(next, "forward");
  };

  const handleBackward = async () => {
    const first = rowItems.at(0);
    if (!first) {
      return;
    }
    const q = searchQuery || undefined;
    const next = toNormalizedListQuery(q, {
      cursor: first.id,
      direction: "backward",
      limit: limitFromUrl,
    });
    await navigateWithTransition(next, "backward");
  };

  const handleLimitChange = async (newLimit: number) => {
    const q = searchQuery || undefined;
    await navigateWithQuery(toNormalizedListQuery(q, { limit: newLimit }));
  };
</script>

{#if rowItems.length === 0 && !store.loading}
  <p class="pe-1 text-right text-sm text-gray-500 italic">No items found</p>
{:else}
  <div class="mbe-6 flex items-center justify-between gap-4">
    <select
      name="limit"
      class={buttonVariants({
        variant: "outline",
        class: "h-10 w-20",
      })}
      disabled={!canNavigate || store.loading}
      onchange={(e) =>
        handleLimitChange(Number((e.currentTarget as HTMLSelectElement).value))}
    >
      {#each LIMITS as limitOption (limitOption)}
        <option
          selected={limitOption === limitFromUrl}
          value={String(limitOption)}>{limitOption}</option
        >
      {/each}
    </select>
    <div class="flex items-center gap-2">
      <button
        type="button"
        class={buttonVariants({ variant: "outline" })}
        aria-label="Previous page"
        disabled={!pageMeta.hasPreviousPage || store.loading}
        onclick={handleBackward}
      >
        <ChevronLeftIcon class="aspect-square inline-4" />
      </button>
      <button
        type="button"
        class={buttonVariants({ variant: "outline" })}
        aria-label="Next page"
        disabled={!pageMeta.hasNextPage || store.loading}
        onclick={handleForward}
      >
        <ChevronRightIcon class="aspect-square inline-4" />
      </button>
    </div>
  </div>
{/if}
