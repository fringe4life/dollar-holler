<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { flex } from "#styled-system/patterns/index.js";
  import type { Snippet } from "svelte";
  import { swipe } from "#lib/client/attachments/swipe.svelte.ts";
  import { Toggle } from "#lib/client/runes/Toggle.svelte.ts";
  import Cancel from "#lib/components/icons/Cancel.svelte";
  import { actionButton } from "#lib/styles.ts";

  interface Props {
    content: Snippet;
    contentClass: string;
    /** Stable name for View Transitions API (e.g. `client-${id}`) so rows morph instead of cross-fading. */
    contentViewTransitionName: string;
    revealed: Snippet;
  }

  let { content, revealed, contentClass, contentViewTransitionName }: Props =
    $props();
  const swipeReset = new Toggle();
</script>

<div
  class={css({
    isolation: "isolate",
    position: "relative",
  })}
  data-swipeable
  style:view-transition-name={contentViewTransitionName}
>
  <!-- CONTENT displayed by default -->
  <div
    class={cx(css({ zIndex: 5 }), contentClass)}
    {@attach swipe({
      triggerReset: swipeReset.isOn,
      onResetComplete: swipeReset.off,
    })}
  >
    {@render content()}
  </div>
  <!-- REVEALED CONTENT displayed when the user swipes the card -->
  <div
    class={flex({
      align: "center",
      blockSize: "full",
      inlineSize: "full",
      inset: 0,
      justify: "space-around",
      position: "absolute",
      zIndex: 1,
    })}
  >
    <button class={actionButton} onclick={swipeReset.toggle} type="button">
      <Cancel height={32} width={32} />
      Cancel
    </button>
    {@render revealed()}
  </div>
</div>

<style>
  /* Kill row VT names during typed pagination transitions (!important overrides inline style). */
  :global {
    :active-view-transition-type(forward),
    :active-view-transition-type(backward) {
      & [data-swipeable] {
        view-transition-name: none !important;
      }
    }
  }
</style>
