<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";
  import { cx } from "#styled-system/css/cx.js";
  import { CORNER_SHAPE } from "#lib/styles.ts";
  import type { ToastType } from "./toaster.svelte.ts";

  const TOAST_TOP = "1rem";
  /** Visible peek between stacked cards: minBlockSize token 12 (3rem) minus overlap. */
  const TOAST_STACK_STEP = "2.25rem";
  /** Extra lift applied to the whole stack on group hover. */
  const TOAST_HOVER_LIFT = "0.5rem";
  /** Additional per-index spread on hover, beyond {@link TOAST_STACK_STEP}. */
  const TOAST_HOVER_FAN_STEP = "1.5rem";

  /**
   * Workaround: top-level `css()` maps instead of `cva` so hashed class names do
   * not force the full recipe runtime into the client bundle.
   *
   * @remarks
   * Still required on `@pandacss/vite@2.5.0` / `@pandacss/dev@2.5.0` with
   * `hash: true`. Drop when Panda folds hashed local `cva`/`sva` to string
   * lookups; re-verify no client chunk with `compoundVariants` / `__cva__`
   * after clean build.
   *
   * @see https://github.com/chakra-ui/panda/issues/3853 — related transform diagnostics
   * @see https://github.com/fringe4life/van-life/issues/471 — established pattern
   * @see https://github.com/fringe4life/dollar-holler/issues/109 — tracking
   */
  const toastBase = css({
    alignItems: "center",
    borderRadius: "xl",
    borderStyle: "solid",
    borderWidth: "2px",
    boxShadow: "md",
    columnGap: 4,
    cornerShape: CORNER_SHAPE,
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
  });

  const toastByType = {
    error: css({
      "& [data-description]": { color: "destructiveForeground" },
      backgroundColor: "destructive",
      borderColor: "destructive",
      color: "destructiveForeground",
    }),
    info: css({
      backgroundColor: "muted",
      borderColor: "borderSubtle",
      color: "foreground",
    }),
    success: css({
      backgroundColor: "surface",
      borderColor: "success",
      color: "foreground",
    }),
    warning: css({
      backgroundColor: "surface",
      borderColor: "warning",
      color: "foreground",
    }),
  } as const satisfies Record<ToastType, string>;

  function toastRecipe({ type }: { type: ToastType }) {
    return cx(toastBase, toastByType[type]);
  }

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
    color: "textMuted",
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
