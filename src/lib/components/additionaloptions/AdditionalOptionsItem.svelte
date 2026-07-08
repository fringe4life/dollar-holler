<script lang="ts">
  import { css, cx } from "styled-system/css";
  import { flex } from "styled-system/patterns";
  import type { Component } from "svelte";
  import type { MouseEventHandler } from "svelte/elements";
  import View from "$lib/components/icons/View.svelte";
  import type { IconProps } from "../Icon.svelte";

  export interface Option {
    disabled: boolean;
    icon?: Component<IconProps>;
    label: string;
    onclick: MouseEventHandler<HTMLButtonElement>;
  }

  interface Props {
    option: Option;
  }

  let { option }: Props = $props();
  const Icon = $derived(option.icon || View);
</script>

{#if !option.disabled}
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
        color: { _hover: "daisyBush", base: "pastelPurple" },
        columnGap: 2,
        cursor: "pointer",
        fontWeight: "bold",
        inlineSize: "full",
        padding: 4,
        transitionDuration: "normal",
        transitionProperty: "colors",
      })}
      onclick={option.onclick}
      type="button"
    >
      <Icon />
      {option.label}
    </button>
  </li>
{/if}
