<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { afterNavigate, goto, onNavigate } from "$app/navigation";
  import { resolve } from "$app/paths";
  import Arrow from "$lib/components/icons/Arrow.svelte";
  import type { Maybe } from "$lib/types";

  let { children } = $props();

  // value for determining where escape key or back link take you
  let previousPageLink: Maybe<string> = $derived(undefined);
  afterNavigate((navigation) => {
    previousPageLink = navigation?.from?.url?.pathname;
  });
  // actual derived url
  const getBackUrl = $derived(previousPageLink ?? resolve("/invoices"));
  let isExiting = $state(false);
  let resolveNavigation: (() => void) | undefined = $derived(undefined);

  // used to run exit animation to slide the invoice down and out
  onNavigate(
    () =>
      new Promise((resolve) => {
        resolveNavigation = resolve;
        isExiting = true;
      })
  );

  function handleAnimationEnd() {
    resolveNavigation?.();
  }
</script>

<svelte:window
  onkeydown={(e) => {
    if (e.key === "Escape") {
      goto(getBackUrl);
    }
  }}
/>
<a
  href={getBackUrl}
  class={css({ zIndex: 1000, color: {base: "pastelPurple", _hover: "daisyBush"}, position: "fixed", insetInlineStart: 7, insetBlockStart: 5, transitionProperty: "colors", transitionDuration: "normal", maxInlineSize: "full", _print: { display: "none" } })}
  ><Arrow /></a
>
<div
  class={css({ backgroundColor: { base:"whisper", _print: "transparent" }, overflowY: "clip", paddingBlockStart: { base:16, lg:12 }, paddingBlockEnd: { lg:32 }, blockSize: "full", inlineSize: "full", minBlockSize: "100dvh", paddingY: { _print: 0 } })}
>
  <main
    onanimationend={handleAnimationEnd}
    style="--slide-distance: 100dvh"
    class={cx(
      css({
        marginInline: "auto",
        maxInlineSize: "5xl",
        minBlockSize: "100dvh",
        translate: "0 0",
        transitionProperty: "translate",
        transitionDuration: "normal",
        _starting: { translate: "0 var(--slide-distance)" },
      }),
      isExiting && css({
        animationName: "slide-down",
        animationDuration: "normal",
        animationFillMode: "forwards",
      })
    )}
  >
    {@render children()}
  </main>
</div>
