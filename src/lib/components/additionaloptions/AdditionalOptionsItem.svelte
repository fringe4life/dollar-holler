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
      borderBottomColor: "whisper",
      borderBottomWidth: 2,
      borderBottomStyle: "solid",
      _last: { borderBottomWidth: 0, borderBottomColor: "transparent" },
    })}
  >
    <button
      class={flex({
        columnGap: 2,
        inlineSize: "full",
        padding: 4,
        fontWeight: "bold",
        transitionProperty: "colors",
        transitionDuration: "normal",
        color: {base: "pastelPurple", _hover: "daisyBush"},
        cursor: "pointer",
         })}
      type="button"
      onclick={option.onclick}
    >
      <Icon />
      {option.label}
    </button>
  </li>
{/if}
