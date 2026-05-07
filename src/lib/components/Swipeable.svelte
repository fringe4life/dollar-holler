<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { flex } from "styled-system/patterns";
  import type { Snippet } from "svelte";
  import { swipe } from "$lib/client/attachments/swipe.svelte";
  import { Toggle } from "$lib/client/runes/Toggle.svelte";
  import Cancel from "$lib/components/icons/Cancel.svelte";
  import { actionButton } from "$lib/styles";

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
    position: "relative",
    isolation: "isolate",
  })}
  style:view-transition-name={contentViewTransitionName}
>
  <!-- CONTENT displayed by default -->
  <div
    {@attach swipe({
      triggerReset: swipeReset.isOn,
      onResetComplete: swipeReset.off,
    })}
    class={cx(css({ zIndex: 5 }), contentClass)}
  >
    {@render content()}
  </div>
  <!-- REVEALED CONTENT displayed when the user swipes the card -->
  <div
    class={flex({
      align: "center",
      justify: "space-around",
      position: "absolute",
      inset: 0,
      zIndex: 1,
      blockSize: "full", 
      inlineSize: "full",
    })}
  >
    <button type="button" onclick={swipeReset.toggle} class={actionButton}>
      <Cancel width={32} height={32} />
      Cancel
    </button>
    {@render revealed()}
  </div>
</div>
