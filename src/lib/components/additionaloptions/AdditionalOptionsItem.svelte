<script lang="ts">
  import { css } from "#styled-system/css/index.js";
  import { flex } from "#styled-system/patterns/index.js";
  import type { Component } from "svelte";
  import type { MouseEventHandler } from "svelte/elements";
  import View from "#lib/components/icons/View.svelte";
  import type { IconProps } from "../Icon.svelte";

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
      borderBottomColor: "whisper",
      borderBottomStyle: "solid",
      borderBottomWidth: 2,
    })}
  >
    <button
      class={flex({
        color: {
          _hover: "daisyBush",
          base: "pastelPurple",
          _groupHover: "daisyBush/50",
        },
        columnGap: 2,
        cursor: "pointer",
        fontWeight: "bold",
        inlineSize: "full",
        padding: 4,
        transitionDuration: "normal",
        transitionProperty: "colors",
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
