<script lang="ts">
  /**
   * Search input: calls `store.loadItems` then shallow `pushState` (no full navigation).
   */
  import { pushState } from "$app/navigation";
  import { page } from "$app/state";
  import Search from "$lib/components/icons/Search.svelte";
  import type { SearchableListStore } from "$features/pagination/types";
  import {
    parseLimitParam,
    toNormalizedListQuery,
  } from "$features/pagination/utils/list-query";
  import { buildListSearchString } from "$features/pagination/utils/url";
  import { Toggle } from "$lib/runes/Toggle.svelte";
  import type { KeyboardEventHandler } from "svelte/elements";

  export type Props = {
    store: SearchableListStore;
  };

  let { store }: Props = $props();

  const searchQuery = $derived(page.url.searchParams.get("q") ?? "");

  const loading = new Toggle();

  // svelte-ignore state_referenced_locally
  let search = $state<string>(searchQuery);

  let searchTerm = $derived(search.trim());

  const runSearch = async () => {
    loading.toggle();
    const limit = parseLimitParam(page.url.searchParams.get("limit"));
    const n = toNormalizedListQuery(searchTerm || undefined, { limit });
    const url = `${page.url.pathname}${buildListSearchString(n)}`;
    try {
      store.presetClientListQueryKey?.(n);
      if (typeof document.startViewTransition === "function") {
        await document.startViewTransition(async () => {
          pushState(url, {});
          await store.loadItems(n);
        }).finished;
      } else {
        pushState(url, {});
        await store.loadItems(n);
      }
    } finally {
      loading.off();
    }
  };

  const handleSearchClick = () => runSearch();

  const handleKeydown: KeyboardEventHandler<
    HTMLInputElement | HTMLButtonElement
  > = (e) => {
    if (e.key === "Enter") {
      runSearch();
    }
  };
</script>

<div
  class="grid grid-flow-col grid-cols-[24px_1fr] items-baseline gap-x-2 inline-full"
  aria-busy={loading.isOn}
>
  <span
    class="text-pastelPurple inline-flex aspect-square items-center justify-center self-center contain-strict inline-6"
    style:view-transition-name="search-icon-loader"
  >
    {#if loading.isOn}
      <span class="search-spinner" aria-hidden="true"></span>
    {:else}
      <Search />
    {/if}
  </span>
  <div class="relative isolate z-0 flex items-baseline inline-full">
    <input
      class="peer search border-b-pastelPurple font-sansserif border-b-2 border-dashed bg-transparent pe-16 text-black transition-colors duration-200 inline-full placeholder:text-transparent md:pe-0 md:inline-52 lg:text-xl lg:inline-72"
      type="search"
      name="search"
      placeholder="Search by keyword"
      id="search"
      bind:value={search}
      onkeydown={handleKeydown}
    />
    <span
      aria-hidden="true"
      class="border-b-lavenderIndigo ease-anticipate supports-linear:ease-anticipate pointer-events-none absolute inset-x-0 bottom-0 origin-left scale-x-90 border-b-2 border-solid opacity-0 transition-[opacity,scale] duration-200 block-2 peer-not-placeholder-shown:scale-x-100 peer-not-placeholder-shown:opacity-100 peer-focus:scale-x-100 peer-focus:opacity-100 md:inline-52 lg:inline-72"
    ></span>
    <button
      type="button"
      onclick={handleSearchClick}
      onkeydown={handleKeydown}
      class="font-sansserif text-pastelPurple peer-not-placeholder-shown:text-lavenderIndigo peer-focus:text-lavenderIndigo peer-focus:hover:text-daisyBush peer-focus:focus:text-daisyBush supports-linear:ease-anticipate pointer-events-none absolute translate-x-0 transform text-xl font-black transition-transform duration-200 ease-out inline-15.5 not-placeholder-shown:pointer-events-auto"
      >Search</button
    >
  </div>
</div>

<style>
  @reference "#app.css";
  input:is(:focus, :not(:placeholder-shown)) ~ button {
    @apply pointer-events-auto right-0 text-right md:right-auto md:translate-x-52 lg:translate-x-72;
  }

  .search-spinner {
    display: block;
    inline-size: 20px;
    aspect-ratio: 1;
    border: 2px solid currentColor;
    border-bottom-color: transparent;
    border-radius: 50%;
    animation: --search-spin 0.7s linear infinite;
  }

  @keyframes --search-spin {
    to {
      rotate: 360deg;
    }
  }

  :global {
    ::view-transition-group(search-icon-loader) {
      animation-duration: 0.35s;
      animation-timing-function: var(
        --ease-glide,
        cubic-bezier(0.33, 1, 0.68, 1)
      );
    }
    ::view-transition-old(search-icon-loader),
    ::view-transition-new(search-icon-loader) {
      mix-blend-mode: normal;
    }
  }
</style>
