<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import { cq, flex } from "#styled-system/patterns/index.js";
  import type { Snippet } from "svelte";
  import Button from "#lib/components/primitives/button/button.svelte";
  import { swipe } from "./swipe.svelte.ts";
  import Cancel from "#lib/components/primitives/icons/Cancel.svelte";
  import {
    rowActionButtonGroup,
    rowActionLabel,
    rowActionRail,
  } from "#lib/styles.ts";

  interface Props {
    actions: Snippet;
    content: Snippet<[showActions: () => void, isRevealed: boolean]>;
    contentClass: string;
    /** Stable name for View Transitions API so rows morph instead of cross-fading. */
    contentViewTransitionName: string;
    revealed: Snippet;
  }

  let {
    actions,
    content,
    revealed,
    contentClass,
    contentViewTransitionName,
  }: Props = $props();
  let isSwipeEnabled = $state(false);
  let isRevealed = $state(false);

  const showActions = (): void => {
    if (isSwipeEnabled) {
      isRevealed = true;
    }
  };

  const closeActions = (): void => {
    isRevealed = false;
  };

  const handleSwipeModeChange = (swipeEnabled: boolean): void => {
    isSwipeEnabled = swipeEnabled;
    if (!swipeEnabled) {
      isRevealed = false;
    }
  };

  const handleSwipeLeft = (): void => {
    isRevealed = true;
  };

  const handleSwipeRight = (): void => {
    isRevealed = false;
  };

  let swipeActionsId = $derived(`${contentViewTransitionName}-actions`);
  const rowContainerClass = cx(
    css({ isolation: "isolate", inlineSize: "full", position: "relative" }),
    cq({ name: "item-row" })
  );
  const frontLayerClass = css({
    inlineSize: "full",
    position: "relative",
    zIndex: 5,
  });
  const revealedLayerClass = cx(
    flex({
      align: "center",
      blockSize: "full",
      inlineSize: "full",
      inset: 0,
      justify: "space-around",
      position: "absolute",
      zIndex: 1,
    }),
    css({ "@item-row/md": { display: "none" } })
  );
  const cancelButtonClass = css({
    backgroundColor: "surfaceMuted",
    color: "foreground",
    flexDirection: "column",
    fontSize: "2xs",
    gap: 1,
    minBlockSize: 12,
    minInlineSize: 12,
    padding: 1,
    _hover: {
      backgroundColor: "warning/20",
      color: "foreground",
    },
    _dark: {
      backgroundColor: "surface",
      color: "foreground",
      _hover: { backgroundColor: "surfaceSecondary" },
      _active: { backgroundColor: "success/15", color: "success" },
    },
  });
</script>

<div
  class={rowContainerClass}
  data-swipeable
  style:view-transition-name={contentViewTransitionName}
>
  <div
    class={cx(frontLayerClass, contentClass)}
    {@attach swipe({
      getTriggerReveal: () => isRevealed,
      onSwipeLeft: handleSwipeLeft,
      onSwipeModeChange: handleSwipeModeChange,
      onSwipeRight: handleSwipeRight,
    })}
  >
    {@render content(showActions, isRevealed)}
    <div class={rowActionRail} data-button-actions>
      <span class={rowActionLabel}>Actions</span>
      <div class={rowActionButtonGroup}>{@render actions()}</div>
    </div>
  </div>
  <div
    id={swipeActionsId}
    aria-hidden={!isSwipeEnabled || !isRevealed}
    class={revealedLayerClass}
    data-swipe-actions
    inert={!isSwipeEnabled || !isRevealed}
  >
    <Button
      aria-controls={swipeActionsId}
      aria-expanded={isRevealed}
      aria-label="Close row actions"
      class={cancelButtonClass}
      onclick={closeActions}
      size="icon"
      variant="outline"
    >
      <Cancel height={24} width={24} />
      Cancel
    </Button>
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
