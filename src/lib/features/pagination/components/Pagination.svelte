<script generics="T extends CursorRow" lang="ts">
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { css } from "styled-system/css";
  import { between, hstack, square } from "styled-system/patterns";
  /**
   * Keyset pagination: changing `limit` resets cursor/direction (first page at new size).
   */
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import type {
    CursorRow,
    PaginationMetadata,
    PaginationSearchParams,
  } from "#features/pagination/types";
  import {
    parseLimitParam,
    toNormalizedListQuery,
  } from "#features/pagination/utils/list-query";
  import {
    buildListSearchString,
    visibleListUrl,
  } from "#features/pagination/utils/url";
  import Button from "#lib/components/ui/button/button.svelte";
  import Select from "#lib/components/ui/select/Select.svelte";
  import { LIMITS, type ListLimit } from "../constants";
  import type { ListDirection } from "../types";

  interface Props {
    items: T[];
    paginationMetadata: PaginationMetadata;
    pending?: boolean;
  }

  let { items, paginationMetadata, pending = false }: Props = $props();

  const listUrl = $derived(visibleListUrl(page));
  const searchQuery = $derived(listUrl.searchParams.get("q") ?? "");
  const limitFromUrl = $derived(
    parseLimitParam(listUrl.searchParams.get("limit"))
  );

  const canNavigate = $derived(
    paginationMetadata.hasNextPage || paginationMetadata.hasPreviousPage
  );

  const navigateWithQuery = async (next: PaginationSearchParams) => {
    await goto(`${listUrl.pathname}${buildListSearchString(next)}`, {
      shallow: true,
    });
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
        update: async () => {
          await navigateWithQuery(next);
        },
      }).finished;
    } catch {
      await navigateWithQuery(next);
    }
  };
  const handleForward = async () => {
    const last = items.at(-1);
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
    const first = items.at(0);
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

  const handleLimitChange = async (newLimit: ListLimit) => {
    const q = searchQuery || undefined;
    await navigateWithQuery(toNormalizedListQuery(q, { limit: newLimit }));
  };
</script>

{#if items.length === 0 && !pending}
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
  <div
    class={between({
      marginBlockEnd: 6,
      gap: 4,
    })}
  >
    <Select
      class={css({ aspectRatio: "2/1", maxInlineSize: "fit-content" })}
      disabled={!canNavigate || pending}
      name="limit"
      onchange={(e) =>
        handleLimitChange(parseLimitParam(e.currentTarget.value))}
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
    <div class={hstack({ gap: 2 })}>
      <Button
        aria-label="Previous page"
        disabled={!paginationMetadata.hasPreviousPage || pending}
        onclick={handleBackward}
        size="default"
        type="button"
        variant="outline"
      >
        <ChevronLeftIcon class={square({ size: 4 })} />
      </Button>
      <Button
        aria-label="Next page"
        disabled={!paginationMetadata.hasNextPage || pending}
        onclick={handleForward}
        size="default"
        type="button"
        variant="outline"
      >
        <ChevronRightIcon class={square({ size: 4 })} />
      </Button>
    </div>
  </div>
{/if}
