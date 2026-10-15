<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { afterNavigate, goto, onNavigate } from "$app/navigation";
  import { resolve } from "$app/paths";
  import { listReturnHrefFor } from "#features/pagination/utils/list-return-href.ts";
  import Arrow from "#lib/components/primitives/icons/Arrow.svelte";
  import type { Maybe } from "#lib/types.ts";

  let { children } = $props();

  // value for determining where escape key or back link take you
  let previousPageLink: Maybe<string> = $state(undefined);
  afterNavigate((navigation) => {
    if (navigation.shallow) {
      return;
    }
    const fromUrl = navigation.from?.url;
    if (!fromUrl) {
      previousPageLink = undefined;
      return;
    }
    // Prefer the shallow-visible list href; Kit's from.url is the load URL.
    previousPageLink =
      listReturnHrefFor(fromUrl.pathname) ??
      `${fromUrl.pathname}${fromUrl.search}`;
  });
  // actual derived url
  const getBackUrl = $derived(previousPageLink ?? resolve("invoices"));
  let isExiting = $state(false);
  let resolveNavigation: (() => void) | undefined = $state(undefined);

  // used to run exit animation to slide the invoice down and out
  onNavigate((navigation) => {
    if (navigation.shallow) {
      return;
    }
    return new Promise((resolve) => {
      resolveNavigation = resolve;
      isExiting = true;
    });
  });

  function handleAnimationEnd() {
    resolveNavigation?.();
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") {
      // pathname+search from the opener, or already-resolved invoices index
      // eslint-disable-next-line svelte/no-navigation-without-resolve -- not a route id
      goto(getBackUrl, { replace: true });
    }
  }}
/>
<!-- eslint-disable svelte/no-navigation-without-resolve -- pathname+search or resolved index -->
<a
  class={css({
    zIndex: 1000,
    color: { base: "mutedAction", _hover: "foreground" },
    position: "fixed",
    insetInlineStart: 7,
    insetBlockStart: 5,
    transitionProperty: "colors",
    transitionDuration: "normal",
    maxInlineSize: "full",
    _print: { display: "none" },
  })}
  data-sveltekit-replacestate
  href={getBackUrl}><Arrow /></a
>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
<div
  class={css({
    backgroundColor: { base: "background", _print: "transparent" },
    overflowY: "clip",
    paddingBlockStart: { base: 16, lg: 12 },
    paddingBlockEnd: { lg: 32 },
    blockSize: "full",
    inlineSize: "full",
    minBlockSize: "100dvh",
    paddingY: { _print: 0 },
  })}
>
  <main
    class={cx(
      css({
        marginInline: "auto",
        maxInlineSize: "5xl",
        minBlockSize: "100dvh",
        // Keep the visually offset invoice surface inside the scrollable flow.
        paddingBlockEnd: { base: 36, _print: 0 },
        translate: "0 0",
        transitionProperty: "translate",
        transitionDuration: "normal",
        _starting: { translate: "0 var(--slide-distance)" },
      }),
      isExiting &&
        css({
          animationName: "slide-down",
          animationDuration: "normal",
          animationFillMode: "forwards",
        })
    )}
    onanimationend={handleAnimationEnd}
    style="--slide-distance: 100dvh"
  >
    {@render children()}
  </main>
</div>
