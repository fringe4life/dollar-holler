<script lang="ts">
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
  import { square } from "#styled-system/patterns/index.js";
  import { page } from "$app/state";
  import { gotoList } from "#features/pagination/utils/goto-list.ts";
  import {
    parseLimitParam,
    readListQuery,
  } from "#features/pagination/utils/list-query.ts";
  import { supportsBaseSelect } from "#lib/client/supports.ts";
  import Rows, {
    type RowCount,
  } from "#lib/components/primitives/icons/Rows.svelte";
  import Select from "#lib/components/primitives/select/Select.svelte";
  import { LIMITS, type ListLimit } from "../constants";

  /**
   * Density mark per page size. 50 is the "many" mark (five tight bars with a
   * short last one) rather than a fourth equal stack.
   */
  const LIMIT_BARS: Record<ListLimit, RowCount> = {
    10: 2,
    25: 3,
    50: 5,
  };

  const limitIconClass = cx(
    css({ color: "textMuted", flexShrink: 0 }),
    square({ size: 4 })
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
    paddingInlineEnd: 6,
  })}
  wrapperClass={css({ inlineSize: "fit-content" })}
  bind:value={limitSelectValue}
  disabled={pending}
  name="limit"
  onchange={(e) => handleLimitChange(parseLimitParam(e.currentTarget.value))}
>
  {#each LIMITS as limitOption (limitOption)}
    <option
      onclick={() => handleLimitChange(limitOption)}
      value={String(limitOption)}
    >
      {#if supportsBaseSelect}
        <Rows
          aria-hidden="true"
          class={limitIconClass}
          count={LIMIT_BARS[limitOption]}
        />
      {/if}
      {limitOption}
    </option>
  {/each}
</Select>
