<script lang="ts" module>
  import { css, cva } from "#styled-system/css/index.js";
  import type { ToastType } from "./toaster.svelte.ts";

  const TOAST_TOP = "1rem";
  /** Visible peek between stacked cards: minBlockSize token 12 (3rem) minus overlap. */
  const TOAST_STACK_STEP = "2.25rem";
  /** Extra lift applied to the whole stack on group hover. */
  const TOAST_HOVER_LIFT = "0.5rem";
  /** Additional per-index spread on hover, beyond {@link TOAST_STACK_STEP}. */
  const TOAST_HOVER_FAN_STEP = "1.5rem";

  const toastRecipe = cva({
    base: {
      alignItems: "center",
      borderRadius: "lg",
      borderStyle: "solid",
      borderWidth: "2px",
      boxShadow: "md",
      columnGap: 4,
      fontFamily: "sansserif",
      fontSize: { base: "md", md: "lg" },
      fontWeight: "bold",
      inlineSize: "min(calc(100% - 2rem), 26rem)",
      inset: "auto",
      insetBlockStart: `calc(${TOAST_TOP} + var(--i) * ${TOAST_STACK_STEP})`,
      insetInline: "0",
      justifyContent: "space-between",
      margin: 0,
      marginInline: "auto",
      maxInlineSize: "26rem",
      minBlockSize: 12,
      opacity: 0,
      paddingBlock: 3,
      paddingInline: 5,
      pointerEvents: "auto",
      position: "fixed",
      transitionBehavior: "allow-discrete",
      transitionDuration: "normal",
      transitionProperty:
        "opacity, translate, display, overlay, inset-block-start",
      transitionTimingFunction: "ease-out",
      translate: "0 0.5rem",
      _groupHasToastHover: {
        insetBlockStart: `calc(${TOAST_TOP} + var(--i) * (${TOAST_STACK_STEP} + ${TOAST_HOVER_FAN_STEP}) + ${TOAST_HOVER_LIFT})`,
      },
      _open: {
        display: "flex",
        opacity: 1,
        translate: "0 0",
        _starting: {
          opacity: 0,
          translate: "0 -0.5rem",
        },
      },
    },
    variants: {
      type: {
        error: {
          "& [data-description]": { color: "goldenFizz" },
          backgroundColor: "scarlet",
          borderColor: "scarlet",
          color: "goldenFizz",
        },
        info: {
          backgroundColor: "fog",
          borderColor: "fog",
          color: "daisyBush",
        },
        success: {
          backgroundColor: "white",
          borderColor: "caribbeanGreen",
          color: "daisyBush",
        },
        warning: {
          backgroundColor: "white",
          borderColor: "goldenFizz",
          color: "daisyBush",
        },
      } satisfies Record<ToastType, Record<string, unknown>>,
    },
  });

  /** Popover handles top-layer display only; live-region role announces insert to AT. */
  const toastLiveRegion = (type: ToastType) =>
    type === "error"
      ? ({ "aria-live": "assertive", role: "alert" } as const)
      : ({ "aria-live": "polite", role: "status" } as const);
</script>

<script lang="ts">
  import type { Snippet } from "svelte";
  import { onMount } from "svelte";
  import Cancel from "#lib/components/primitives/icons/Cancel.svelte";
  import {
    createToaster,
    setToast,
    toastElementId,
    type ToastItem,
  } from "./toaster.svelte.ts";

  let { children }: { children: Snippet } = $props();

  const toaster = createToaster();
  setToast(toaster);

  onMount(() => {
    toaster.syncDocumentHidden();
  });

  const titleClass = css({
    fontWeight: "bold",
    lineHeight: "short",
  });

  const descriptionClass = css({
    color: "monsoon",
    fontSize: "sm",
    fontWeight: "normal",
  });

  const contentClass = css({
    flex: 1,
    minInlineSize: 0,
  });

  const closeButtonClass = css({
    _focusVisible: {
      outlineColor: "currentColor",
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    alignItems: "center",
    backgroundColor: "transparent",
    borderWidth: 0,
    color: "currentColor",
    cursor: "pointer",
    display: "inline-flex",
    flexShrink: 0,
    padding: 0,
  });
</script>

<svelte:document onvisibilitychange={() => toaster.syncDocumentHidden()} />

{#snippet toastCard(item: ToastItem, i: number)}
  {@const elementId = toastElementId(item.id)}
  {@const liveRegion = toastLiveRegion(item.type)}
  <div
    {@attach toaster.connect(item.id)}
    aria-atomic="true"
    aria-live={liveRegion["aria-live"]}
    class={toastRecipe({ type: item.type })}
    id={elementId}
    onpointerenter={() => toaster.pause("hover")}
    onpointerleave={(event) => {
      const group = event.currentTarget.closest(".group");
      if (
        group !== null &&
        event.relatedTarget instanceof Node &&
        group.contains(event.relatedTarget)
      ) {
        return;
      }
      toaster.resume("hover");
    }}
    popover="manual"
    role={liveRegion.role}
    style:--i={i}
  >
    <div class={contentClass}>
      <p class={titleClass}>{item.title}</p>
      {#if item.description}
        <p class={descriptionClass} data-description>
          {item.description}
        </p>
      {/if}
    </div>
    <button
      aria-label="Close notification"
      class={closeButtonClass}
      command="hide-popover"
      commandfor={elementId}
      type="button"
    >
      <Cancel height={24} width={24} />
    </button>
  </div>
{/snippet}

<!--
  Limitation: each toast is a top-layer `popover="manual"`. Modal dialogs
  (`showModal()`) make the rest of the document inert, so toasts that fire
  while a form dialog is open stay visible but are not interactive until
  the dialog closes.
-->
<div class="group" role="presentation">
  {#each toaster.items as item, i (item.id)}
    {@render toastCard(item, i)}
  {/each}
</div>

{@render children()}
