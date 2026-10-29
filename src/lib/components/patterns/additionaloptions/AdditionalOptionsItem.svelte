<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { flex } from "#styled-system/patterns/index.js";
  import type { Component } from "svelte";
  import type { MouseEventHandler } from "svelte/elements";
  import View from "#lib/components/primitives/icons/View.svelte";
  import type { IconProps } from "#lib/components/primitives/Icon.svelte";
  import { CORNER_SHAPE } from "#lib/styles.ts";

  export interface Option {
    disabled: boolean;
    icon?: Component<IconProps>;
    label: string;
    onclick: MouseEventHandler<HTMLButtonElement>;
  }

  interface Props {
    commandFor: string;
    option: Option;
  }

  let { commandFor, option }: Props = $props();
</script>

{#if !option.disabled}
  {@const Icon = option.icon || View}
  <li
    class={css({
      _last: { borderBottomColor: "transparent", borderBottomWidth: 0 },
      borderBottomColor: "borderSubtle",
      borderBottomStyle: "solid",
      borderBottomWidth: 2,
    })}
  >
    <button
      class={flex({
        // surfaceSecondary (not inputBackground) so the row tint is visible on
        // popover in dark mode, where both map to the same gray.
        _hover: { backgroundColor: "surfaceSecondary" },
        borderRadius: "md",
        color: {
          _hover: "foreground",
          base: "mutedAction",
          _groupHover: "foreground/50",
        },
        columnGap: 2,
        cornerShape: CORNER_SHAPE,
        cursor: "pointer",
        fontWeight: "bold",
        inlineSize: "full",
        padding: 4,
        transitionDuration: "normal",
        transitionProperty: "background-color, color",
      })}
      command="hide-popover"
      commandfor={commandFor}
      onclick={option.onclick}
      type="button"
    >
      <Icon />
      {option.label}
    </button>
  </li>
{/if}
