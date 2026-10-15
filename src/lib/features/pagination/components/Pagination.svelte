<script generics="T extends CursorRow" lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { between } from "#styled-system/patterns/index.js";
  import type {
    CursorRow,
    PaginationMetadata,
  } from "#features/pagination/types.ts";
  import PaginationControl from "./PaginationControl.svelte";
  import PaginationLimit from "./PaginationLimit.svelte";

  interface Props {
    items: T[];
    paginationMetadata: PaginationMetadata;
  }

  let { items, paginationMetadata }: Props = $props();

  const pending = $derived($effect.pending() > 0);
</script>

{#if items.length === 0 && !pending}
  <p
    class={css({
      paddingInlineEnd: 1,
      textAlign: "right",
      fontSize: "sm",
      color: "textMuted",
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
    <PaginationLimit />
    <PaginationControl {items} {paginationMetadata} />
  </div>
{/if}
