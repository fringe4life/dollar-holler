<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { circle, flex, grid, gridItem } from "styled-system/patterns";
  import type { KeyboardEventHandler } from "svelte/elements";
  /**
   * Search input: calls `store.loadItems` then shallow `pushState` (no full navigation).
   */
  import { pushState } from "$app/navigation";
  import { page } from "$app/state";
  import type { SearchableListStore } from "$features/pagination/types";
  import {
    parseLimitParam,
    toNormalizedListQuery,
  } from "$features/pagination/utils/list-query";
  import { buildListSearchString } from "$features/pagination/utils/url";
  import { Toggle } from "$lib/client/runes/Toggle.svelte";
  import Search from "$lib/components/icons/Search.svelte";

  export interface SearchProps {
    store: SearchableListStore;
  }

  let { store }: SearchProps = $props();

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
  class={grid({ inlineSize: "full", gridAutoFlow: "column", gridTemplateColumns: "24px 1fr", alignItems: "baseline", columnGap: 2 })}
  aria-busy={loading.isOn}
>
  <span
    class={gridItem({
      color: "pastelPurple",
      aspectRatio: "square",
      alignSelf: "center",
      contain: "strict",
    })}
    style:view-transition-name="search-icon-loader"
    aria-hidden="true"
  >
    {#if loading.isOn}
      <span
        class={circle({
          display: "block",
          size: 5,
          animation: "spin",
          borderWidth: 2,
          borderColor: "currentColor",
          borderBottomColor: "transparent",
        })}
        aria-hidden="true"
      ></span>
    {:else}
      <Search />
    {/if}
  </span>
  <div
    class={flex({
      align: "baseline", 
      position: "relative",
      isolation: "isolate",
      inlineSize: "full",
      zIndex: 0,  
      })}
  >
    <!-- "peer search border-b-pastelPurple font-sansserif border-b-2 border-dashed bg-transparent pe-16 text-black transition-colors duration-200 inline-full placeholder:text-transparent md:pe-0 md:inline-52 lg:text-xl lg:inline-72" -->
    <input
      class={cx(
        "peer",
        css({
          borderBottom: "pastelPurple",
          fontFamily: "sansserif",
          borderBottomWidth: 2,
          borderBottomStyle: "dashed",
          backgroundColor: "transparent",
          color: "black",
          transitionProperty: "colors",
          transitionDuration: "normal",
          paddingInlineEnd: { base: 16, md: 0 },
          inlineSize: { base: "full", md: 52, lg: 72 },
          _placeholder: {
            color: "transparent",
          },
          _focus: {outline: "none"},
          _focusVisible: {
            outlineColor: "lavenderIndigo",
            outlineWidth: "2px",
            outlineStyle: "solid",
          },
          fontSize:  "xl" ,
        }),
      )}
      type="search"
      name="search"
      placeholder="Search by keyword"
      id="search"
      bind:value={search}
      onkeydown={handleKeydown}
    >
    <span
      aria-hidden="true"
      class={css({
        transitionProperty: "opacity, scale",
        transitionDuration: "normal",
        blockSize: 2,
        inlineSize: { base: "full", md: 52, lg: 72 },
        ".peer:is(:focus, :not(:placeholder-shown)) ~ &": {
          scale: "1",
          opacity: "1",
        },
          transitionTimingFunction: "anticipate",
        
        position: "absolute",
        insetInlineStart: 0,
        insetBlockEnd: 0,
        scaleX: "0.9",
        opacity: "0",
        borderBottomWidth: 2,
        borderBottomStyle: "solid",
        borderBottomColor: "lavenderIndigo",
        _focus: {outline: "none"},
      })}
      // class="border-b-lavenderIndigo ease-anticipate supports-linear:ease-anticipate pointer-events-none absolute inset-x-0 bottom-0 origin-left scale-x-90 border-b-2 border-solid opacity-0 transition-[opacity,scale] duration-200 block-2 peer-not-placeholder-shown:scale-x-100 peer-not-placeholder-shown:opacity-100 peer-focus:scale-x-100 peer-focus:opacity-100 md:inline-52 lg:inline-72"
    ></span>
    <button
      type="button"
      onclick={handleSearchClick}
      onkeydown={handleKeydown}
      class={css({
        fontFamily: "sansserif",
        color: { base:"pastelPurple", _peerFocus: "lavenderIndigo", _peerHover: "daisyBush" },
        pointerEvents: "none",
        position: "absolute",
        _peerPlaceholderShown: { pointerEvents: "auto" },
        ".peer:is(:focus, :not(:placeholder-shown)) ~ &": {
          pointerEvents: "auto",
          color: "lavenderIndigo",
          insetInlineEnd: { base: 0, md: "auto" },
          translate : { base: "0 100%", md: "token(sizes.52) 0", lg: "token(sizes.72) 0"},
        },
        insetInlineStart: 0,
        fontSize: "xl",
        fontWeight: "black",
        transitionProperty: "translate",
        transitionDuration: "normal",
        transitionTimingFunction: { base:"ease-out", _supportsLinear: "anticipate" },
        inlineSize: 15,
        _focus: {outline: "none"},
        _focusVisible: {
          outlineColor: "lavenderIndigo",
          outlineWidth: "2px",
          outlineStyle: "solid",
        },
      })}
      // class="font-sansserif text-pastelPurple peer-not-placeholder-shown:text-lavenderIndigo peer-focus:text-lavenderIndigo peer-focus:hover:text-daisyBush peer-focus:focus:text-daisyBush supports-linear:ease-anticipate pointer-events-none absolute translate-x-0 transform text-xl font-black transition-transform duration-200 ease-out inline-15.5 not-placeholder-shown:pointer-events-auto"
    >
      Search
    </button>
  </div>
</div>
