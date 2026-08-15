<script generics="T extends CursorRow" lang="ts">
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import Rows2Icon from "@lucide/svelte/icons/rows-2";
  import Rows3Icon from "@lucide/svelte/icons/rows-3";
  import Rows4Icon from "@lucide/svelte/icons/rows-4";
  import { css, cx } from "styled-system/css";
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
  import { supportsBaseSelect } from "#lib/client/supports";
  import Button from "#lib/components/ui/button/button.svelte";
  import Select from "#lib/components/ui/select/Select.svelte";
  import { LIMITS, type ListLimit } from "../constants";
  import type { ListDirection } from "../types";

  /** Row-density icon per page-size option (enhanced select only). */
  const LIMIT_ICONS: Record<ListLimit, typeof Rows2Icon> = {
    10: Rows2Icon,
    25: Rows3Icon,
    50: Rows4Icon,
  };

  // Lucide icons are stroke-based; undo the global `svg { fill }` rule.
  const limitIconClass = cx(
    square({ size: 4 }),
    css({ color: "monsoon", fill: "none", flexShrink: 0 })
  );

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
  // Base-select `change` reports the old value; keep a local binding for display.
  // svelte-ignore state_referenced_locally
  let limitSelectValue = $state(String(limitFromUrl));

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
    if (newLimit === limitFromUrl) {
      return;
    }
    limitSelectValue = String(newLimit);
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
      class={css({
        _supportsBaseSelect: { aspectRatio: "auto" },
        aspectRatio: "2/1",
        maxInlineSize: "fit-content",
      })}
      bind:value={limitSelectValue}
      disabled={pending}
      name="limit"
      onchange={(e) =>
        handleLimitChange(parseLimitParam(e.currentTarget.value))}
    >
      {#each LIMITS as limitOption (limitOption)}
        {const LimitIcon = LIMIT_ICONS[limitOption]}
        <option
          onclick={() => handleLimitChange(limitOption)}
          value={String(limitOption)}
        >
          {#if supportsBaseSelect}
            <LimitIcon aria-hidden="true" class={limitIconClass} />
          {/if}
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
