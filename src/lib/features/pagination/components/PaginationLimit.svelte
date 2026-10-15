<script lang="ts">
  import Rows2Icon from "@lucide/svelte/icons/rows-2";
  import Rows3Icon from "@lucide/svelte/icons/rows-3";
  import Rows4Icon from "@lucide/svelte/icons/rows-4";
  import { css, cx } from "#styled-system/css/index.js";
  import { square } from "#styled-system/patterns/index.js";
  import { page } from "$app/state";
  import { gotoList } from "#features/pagination/utils/goto-list.ts";
  import {
    parseLimitParam,
    readListQuery,
  } from "#features/pagination/utils/list-query.ts";
  import { supportsBaseSelect } from "#lib/client/supports.ts";
  import Select from "#lib/components/primitives/select/Select.svelte";
  import { LIMITS, type ListLimit } from "../constants";

  /** Row-density icon per page-size option (enhanced select only). */
  const LIMIT_ICONS: Record<ListLimit, typeof Rows2Icon> = {
    10: Rows2Icon,
    25: Rows3Icon,
    50: Rows4Icon,
  };

  // Lucide icons are stroke-based; undo the global `svg { fill }` rule.
  const limitIconClass = cx(
    square({ size: 4 }),
    css({ color: "textMuted", fill: "none", flexShrink: 0 })
  );

  const pending = $derived($effect.pending() > 0);

  const query = $derived(readListQuery(page));
  // Base-select `change` reports the old value; keep a local binding for display.
  // svelte-ignore state_referenced_locally
  let limitSelectValue = $state(String(query.limit));
  // svelte-ignore state_referenced_locally
  let syncedLimit = query.limit;

  $effect(() => {
    if (query.limit !== syncedLimit) {
      syncedLimit = query.limit;
      limitSelectValue = String(query.limit);
    }
  });

  /**
   * Keyset pagination: changing `limit` resets cursor/direction (first page at new size).
   */
  const handleLimitChange = async (newLimit: ListLimit) => {
    if (newLimit === query.limit) {
      return;
    }
    limitSelectValue = String(newLimit);
    await gotoList(page, { limit: newLimit, type: "limit" });
  };
</script>

<Select
  aria-label="Items per page"
  class={css({
    _supportsBaseSelect: { aspectRatio: "auto" },
    aspectRatio: "2/1",
    maxInlineSize: "fit-content",
  })}
  bind:value={limitSelectValue}
  disabled={pending}
  name="limit"
  onchange={(e) => handleLimitChange(parseLimitParam(e.currentTarget.value))}
>
  {#each LIMITS as limitOption (limitOption)}
    {@const LimitIcon = LIMIT_ICONS[limitOption]}
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
