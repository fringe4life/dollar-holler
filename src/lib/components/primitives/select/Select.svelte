<script lang="ts" module>
  import { css } from "#styled-system/css/css.js";

  /**
   * Positioned, or the indicator resolves against the page and lands nowhere —
   * and deliberately unsized. A default `inline-size: full` here beats the
   * caller's `fit-content` on atomic order, which stretched the page-size box to
   * the whole pager row and parked the chevron out by the next/previous buttons.
   * Left auto, the wrapper hugs the select in a flex row and fills a column in
   * block flow; callers that need full width say so through `wrapperClass`.
   */
  const defaultWrapperClass = css({
    display: "grid",
    position: "relative",
  });

  /**
   * The indicator, not a `background-image`. The old one was a data-URI grey
   * that could not take `currentColor`, could not be split into parts, and had
   * to be hidden again the moment `<select>` grew a real picker icon.
   *
   * It renders for both branches — classic `<select>` and `appearance:
   * base-select` — so the mark is the same glyph everywhere. The UA picker icon
   * is suppressed below; this is the only chevron the control shows.
   */
  const indicatorClass = css({
    color: "textMuted",
    insetBlockStart: "50%",
    insetInlineEnd: 2.5,
    pointerEvents: "none",
    position: "absolute",
    transitionDuration: "normal",
    transitionProperty: "rotate",
    translate: "0 -50%",
    ":where(select):disabled ~ &": { opacity: 0.45 },
    ":where(select):open ~ &": { rotate: "180deg" },
    _motionReduce: { transitionDuration: "0.01ms" },
  });
</script>

<script lang="ts">
  import { cx } from "#styled-system/css/cx.js";
  import type { HTMLSelectAttributes } from "svelte/elements";
  import { supportsBaseSelect } from "#lib/client/supports.ts";
  import ChevronDown from "#lib/components/primitives/icons/ChevronDown.svelte";
  import { CORNER_SHAPE } from "#lib/styles.ts";

  const selectClass = css({
    "&::picker(select)": {
      appearance: "base-select",
      backgroundColor: "popover",
      borderColor: "border",
      borderRadius: "xl",
      borderWidth: 2,
      boxShadow: "tableRowHover",
      cornerShape: CORNER_SHAPE,
      marginBlockStart: 1,
      minInlineSize: "anchor-size(self-inline)",
      opacity: 0,
      padding: 1,
      transitionBehavior: "allow-discrete",
      transitionDuration: "normal",
      transitionProperty: "opacity, translate, display, overlay",
      translate: "0 -0.5rem",
    },
    "&:open::picker(select)": {
      opacity: 1,
      translate: "0 0",
    },
    _ariaInvalid: {
      borderColor: "destructive",
    },
    _disabled: {
      _hover: {
        backgroundColor: "inherit",
        borderColor: "inherit",
        color: "inherit",
      },
      backgroundColor: "transparent",
      borderColor: "destructive",
      color: "destructive",
      cursor: "not-allowed",
    },
    _focusWithin: { borderColor: "ring" },
    _focusVisible: {
      borderColor: "ring",
      outlineColor: "ring",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    _starting: {
      "&:open::picker(select)": {
        opacity: 0,
        translate: "0 -0.5rem",
      },
    },
    _userInvalid: {
      borderColor: "destructive",
    },
    _supportsBaseSelect: {
      /* The glyph beside the select is the chevron; the UA's is a second one. */
      "&::picker-icon": {
        content: "none",
      },
      "& option": {
        _checked: {
          color: "foreground",
          fontWeight: "bold",
        },
        _hover: {
          backgroundColor: "inputBackground",
        },
        alignItems: "center",
        borderRadius: "md",
        cornerShape: CORNER_SHAPE,
        display: "flex",
        gap: 2,
        paddingBlock: 2,
        paddingInline: 3,
        transitionDuration: "fast",
        transitionProperty: "background-color, color",
      },
      "& option::checkmark": {
        color: "ring",
      },
      "& selectedcontent": {
        alignItems: "center",
        display: "flex",
        gap: 2,
        overflow: "hidden",
      },
      "& selectedcontent > *": {
        _starting: {
          opacity: 0,
          translate: "0 var(--spacing-1)",
        },
        opacity: 1,
        transitionDuration: "fast",
        transitionProperty: "opacity, translate",
        transitionTimingFunction: "out",
        translate: "0 0",
      },
      alignItems: "center",
      appearance: "base-select",
      display: "flex",
      gap: 2,
    },
    appearance: "none",
    blockSize: 10,
    borderColor: "input",
    borderRadius: "lg",
    borderWidth: 2,
    cornerShape: CORNER_SHAPE,
    inlineSize: "full",
    paddingInlineEnd: 7,
    paddingInlineStart: 4,
    transitionDuration: "normal",
    transitionProperty: "colors",
  });

  let {
    class: className = "",
    wrapperClass = "",
    children,
    value = $bindable(),
    ...rest
  }: Omit<HTMLSelectAttributes, "class"> & {
    class?: string;
    /** Sizing for the wrapper that holds the indicator. */
    wrapperClass?: string;
  } = $props();
</script>

<!--
  Progressive enhancement: browsers supporting customizable selects
  (`appearance: base-select`) get a first-child <button><selectedcontent>
  pair (mirroring the selected option's rich content), a styled and animated
  ::picker(select) popover and the house chevron. The button branch is
  client-only, so SSR and legacy parsers only ever see a classic <select>.

  The wrapper exists so one glyph can sit in the corner in both branches: a
  classic <select> cannot hold markup, and `::picker-icon` only exists in the
  enhanced branch.
-->
<div class={cx(defaultWrapperClass, wrapperClass)}>
  <select class={cx(selectClass, className)} {...rest} bind:value>
    {#if supportsBaseSelect}
      <button>
        <selectedcontent></selectedcontent>
      </button>
    {/if}
    {@render children?.()}
  </select>
  <ChevronDown aria-hidden="true" class={indicatorClass} size={14} />
</div>
