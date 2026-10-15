<script generics="T extends CursorRow" lang="ts">
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";
  import { cx } from "#styled-system/css/index.js";
  import {
    hstack,
    square,
    visuallyHidden,
  } from "#styled-system/patterns/index.js";
  import { page } from "$app/state";
  import type {
    CursorRow,
    PaginationMetadata,
  } from "#features/pagination/types.ts";
  import { gotoList } from "#features/pagination/utils/goto-list.ts";
  import Button from "#lib/components/primitives/button/button.svelte";
  import { directionalArrow } from "#lib/styles.ts";

  interface Props {
    items: T[];
    paginationMetadata: PaginationMetadata;
  }

  let { items, paginationMetadata }: Props = $props();

  const pending = $derived($effect.pending() > 0);

  const handleForward = async () => {
    const last = items.at(-1);
    if (!last) {
      return;
    }
    await gotoList(page, { cursor: last.id, type: "forward" });
  };

  const handleBackward = async () => {
    const first = items.at(0);
    if (!first) {
      return;
    }
    await gotoList(page, { cursor: first.id, type: "backward" });
  };
</script>

<nav aria-busy={pending} aria-label="Pagination" class={hstack({ gap: 2 })}>
  <span aria-atomic="true" aria-live="polite" class={visuallyHidden()}>
    {#if pending}Loading page…{/if}
  </span>
  <Button
    aria-label="Go to previous page"
    class="group"
    disabled={!paginationMetadata.hasPreviousPage || pending}
    onclick={handleBackward}
    size="default"
    type="button"
    variant="outline"
  >
    <ChevronLeftIcon
      aria-hidden="true"
      class={cx(
        square({ size: 4 }),
        directionalArrow({ direction: "backward" })
      )}
    />
  </Button>
  <Button
    aria-label="Go to next page"
    class="group"
    disabled={!paginationMetadata.hasNextPage || pending}
    onclick={handleForward}
    size="default"
    type="button"
    variant="outline"
  >
    <ChevronRightIcon
      aria-hidden="true"
      class={cx(
        square({ size: 4 }),
        directionalArrow({ direction: "forward" })
      )}
    />
  </Button>
</nav>
