<script lang="ts">
  import { cx } from "#styled-system/css/index.js";
  import type { Snippet } from "svelte";
  import { DEFAULT_LIMIT } from "../constants";
  import {
    paginatedListGrid,
    paginatedListRows,
    paginatedListStack,
  } from "../styles";
  import PaginationSkeleton from "./PaginationSkeleton.svelte";

  interface Props {
    class?: string;
    header: Snippet;
    skeleton: Snippet;
    skeletonCount?: number;
  }

  let {
    class: extraClass,
    header,
    skeleton,
    skeletonCount = DEFAULT_LIMIT,
  }: Props = $props();
</script>

<div
  aria-busy="true"
  aria-label="Loading list"
  class={paginatedListStack}
  role="status"
>
  <div class={cx(paginatedListGrid, extraClass)}>
    {@render header()}
    <div class={paginatedListRows}>
      {#each { length: skeletonCount } as _, i (i)}
        {@render skeleton()}
      {/each}
    </div>
    <PaginationSkeleton />
  </div>
</div>
