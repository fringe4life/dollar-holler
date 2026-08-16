<script lang="ts">
  import { css, cx } from "#styled-system/css/index.js";
  import type { HTMLSelectAttributes } from "svelte/elements";
  import { supportsBaseSelect } from "#lib/client/supports.ts";

  const selectClass = css({
    "&::picker(select)": {
      appearance: "base-select",
      backgroundColor: "white",
      borderColor: "silver",
      borderRadius: "lg",
      borderWidth: 2,
      boxShadow: "tableRowHover",
      marginBlockStart: 1,
      minInlineSize: "anchor-size(self-inline)",
      opacity: 0,
      padding: 1,
      transitionBehavior: "allow-discrete",
      transitionDuration: "normal",
      transitionProperty: "opacity, translate, display, overlay",
      translate: "0 -0.5rem",
    },
    "&::picker-icon": {
      color: "monsoon",
      transitionDuration: "normal",
      transitionProperty: "rotate",
    },
    "&:open::picker(select)": {
      opacity: 1,
      translate: "0 0",
    },
    "&:open::picker-icon": {
      rotate: "180deg",
    },
    _disabled: {
      _hover: {
        backgroundColor: "inherit",
        borderColor: "inherit",
        color: "inherit",
      },
      backgroundColor: "transparent",
      borderColor: "red.500",
      color: "red.500",
      cursor: "not-allowed",
    },
    _focusWithin: { borderColor: "lavenderIndigo" },
    _focusVisible: {
      borderColor: "lavenderIndigo",
      outlineColor: "lavenderIndigo",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
    _starting: {
      "&:open::picker(select)": {
        opacity: 0,
        translate: "0 -0.5rem",
      },
    },
    _supportsBaseSelect: {
      "& option": {
        _checked: {
          color: "daisyBush",
          fontWeight: "bold",
        },
        _hover: {
          backgroundColor: "whisper",
        },
        alignItems: "center",
        borderRadius: "md",
        display: "flex",
        gap: 2,
        paddingBlock: 2,
        paddingInline: 3,
        transitionDuration: "fast",
        transitionProperty: "background-color, color",
      },
      "& option::checkmark": {
        color: "lavenderIndigo",
      },
      "& selectedcontent": {
        alignItems: "center",
        display: "flex",
        gap: 2,
        overflow: "hidden",
      },
      alignItems: "center",
      appearance: "base-select",
      backgroundImage: "none",
      display: "flex",
      gap: 2,
    },
    appearance: "none",
    backgroundImage: "url('/images/chevron-down.svg')",
    backgroundPosition: "97% center",
    backgroundRepeat: "no-repeat",
    blockSize: 10,
    borderColor: "silver",
    borderRadius: "lg",
    borderWidth: 2,
    inlineSize: "full",
    paddingInline: 4,
    transitionDuration: "normal",
    transitionProperty: "colors",
  });

  let {
    class: className = "",
    children,
    value = $bindable(),
    ...rest
  }: Omit<HTMLSelectAttributes, "class"> & { class?: string } = $props();
</script>

<!--
  Progressive enhancement: browsers supporting customizable selects
  (`appearance: base-select`) get a first-child <button><selectedcontent>
  pair (mirroring the selected option's rich content), a styled and animated
  ::picker(select) popover and a rotating ::picker-icon. The button branch is
  client-only, so SSR and legacy parsers only ever see a classic <select>.
-->
<select class={cx(selectClass, className)} {...rest} bind:value>
  {#if supportsBaseSelect}
    <button>
      <selectedcontent></selectedcontent>
    </button>
  {/if}
  {@render children?.()}
</select>
