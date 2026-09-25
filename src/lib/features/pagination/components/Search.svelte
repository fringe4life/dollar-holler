<script lang="ts">
  import { css, cx, viewTransition } from "#styled-system/css/index.js";
  import {
    circle,
    flex,
    grid,
    gridItem,
  } from "#styled-system/patterns/index.js";
  import type { KeyboardEventHandler } from "svelte/elements";
  /**
   * Search input: shallow `goto` only. List pages re-query from the URL.
   */
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    parseLimitParam,
    toNormalizedListQuery,
  } from "#features/pagination/utils/list-query.ts";
  import {
    buildListSearchString,
    visibleListUrl,
  } from "#features/pagination/utils/url.ts";
  import { Toggle } from "#lib/client/runes/Toggle.svelte.ts";
  import { withViewTransition } from "#lib/client/view-transition.ts";
  import Search from "#lib/components/primitives/icons/Search.svelte";

  const searchIconVt = viewTransition({
    group: {
      animationDuration: "slow",
      animationTimingFunction: "glide",
    },
    old: { mixBlendMode: "normal" },
    new: { mixBlendMode: "normal" },
  });

  const listUrl = $derived(visibleListUrl(page));

  const searchQuery = $derived(listUrl.searchParams.get("q") ?? "");

  const loading = new Toggle();

  // svelte-ignore state_referenced_locally
  let search = $state<string>(searchQuery);

  let searchTerm = $derived(search.trim());

  const runSearch = async () => {
    loading.toggle();
    const limit = parseLimitParam(listUrl.searchParams.get("limit"));
    const n = toNormalizedListQuery(searchTerm || undefined, { limit });
    const url = `${listUrl.pathname}${buildListSearchString(n)}`;
    try {
      await withViewTransition({
        update: () => goto(url, { shallow: true }),
      });
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
  aria-busy={loading.isOn}
  class={grid({
    inlineSize: "full",
    gridAutoFlow: "column",
    gridTemplateColumns: "24px 1fr",
    alignItems: "baseline",
    columnGap: 2,
  })}
>
  <span
    aria-hidden="true"
    class={cx(
      searchIconVt,
      gridItem({
        color: "mutedAction",
        aspectRatio: "square",
        alignSelf: "center",
        contain: "strict",
      })
    )}
    style:view-transition-name="search-icon-loader"
  >
    {#if loading.isOn}
      <span
        aria-hidden="true"
        class={circle({
          display: "block",
          size: 5,
          animation: "spin",
          borderWidth: 2,
          borderColor: "currentColor",
          borderBottomColor: "transparent",
        })}
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
    <input
      class={cx(
        "peer",
        css({
          borderBottom: "borderMuted",
          fontFamily: "sansserif",
          borderBottomWidth: 2,
          borderBottomStyle: "dashed",
          backgroundColor: "transparent",
          color: "foreground",
          transitionProperty: "colors",
          transitionDuration: "normal",
          inlineSize: { base: "full", md: 52, lg: 72 },
          _placeholder: {
            color: "transparent",
          },
          _focus: { outline: "none" },
          fontSize: "xl",
        })
      )}
      id="search"
      name="search"
      onkeydown={handleKeydown}
      placeholder="Search by keyword"
      type="search"
      bind:value={search}
    />
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
        borderBottomColor: "ring",
        _focus: { outline: "none" },
      })}
    ></span>
    <button
      class={css({
        fontFamily: "sansserif",
        color: {
          base: "mutedAction",
          _peerFocus: "ring",
          _peerHover: "foreground",
        },
        pointerEvents: "none",
        position: "absolute",
        _peerPlaceholderShown: { pointerEvents: "auto" },
        ".peer:is(:focus, :not(:placeholder-shown)) ~ &": {
          pointerEvents: "auto",
          color: "ring",
          insetInlineEnd: { base: 0, md: "auto" },
          translate: {
            base: "0 100%",
            md: "token(sizes.52) 0",
            lg: "token(sizes.72) 0",
          },
        },
        insetInlineStart: 0,
        fontSize: "xl",
        fontWeight: "black",
        transitionProperty: "translate",
        transitionDuration: "normal",
        transitionTimingFunction: {
          base: "ease-out",
          _supportsLinear: "anticipate",
        },
        inlineSize: 15,
        _focus: { outline: "none" },
        _focusVisible: {
          outlineColor: "ring",
          outlineWidth: "2px",
          outlineStyle: "solid",
        },
      })}
      onclick={handleSearchClick}
      onkeydown={handleKeydown}
      type="button"
    >
      Search
    </button>
  </div>
</div>
