<script lang="ts" generics="T extends CursorRow">
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { css } from "styled-system/css";
  import { flex, square } from "styled-system/patterns";
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
  import Button from "$lib/components/ui/button/button.svelte";
  import Select from "$lib/components/ui/select/Select.svelte";
  import { LIMITS } from "../constants";
  import type { ListDirection } from "../types";

  interface Props {
    store: PaginatableItems<T>;
  }

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
  <p
    class={css({
      paddingInlineEnd: 1,
      textAlign: "right",
      fontSize: "sm",
      color: "gray.500",
      fontStyle: "italic",
    })}
  >
    No items found
  </p>
{:else}
  <!-- "mbe-6 flex items-center justify-between gap-4" -->
  <div
    class={flex({
      marginBlockEnd: 6,
      align: "center",
      justify: "space-between",
      gap: 4,
    })}
  >
    <Select
      name="limit"
      class={css({ blockSize: 10, inlineSize: 20 })}
      disabled={!canNavigate || store.loading}
      onchange={(e) =>
        handleLimitChange(Number((e.currentTarget as HTMLSelectElement).value))}
    >
      {#each LIMITS as limitOption (limitOption)}
        <option
          selected={limitOption === limitFromUrl}
          value={String(limitOption)}
        >
          {limitOption}
        </option>
      {/each}
    </Select>
    <div class={flex({ align: "center", gap: 2 })}>
      <Button
        type="button"
        variant="outline"
        size="default"
        aria-label="Previous page"
        disabled={!pageMeta.hasPreviousPage || store.loading}
        onclick={handleBackward}
      >
        <ChevronLeftIcon class={square({ size: 4 })} />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="default"
        aria-label="Next page"
        disabled={!pageMeta.hasNextPage || store.loading}
        onclick={handleForward}
      >
        <ChevronRightIcon class={square({ size: 4 })} />
      </Button>
    </div>
  </div>
{/if}
