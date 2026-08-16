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
    option: Option;
  }

  let { option }: Props = $props();
  const Icon = $derived(option.icon || View);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    const currentTarget = event.currentTarget;

    if (currentTarget instanceof HTMLElement) {
      currentTarget.closest<HTMLElement>("[popover]")?.hidePopover();
    }

    option.onclick(event);
  };
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
      onclick={handleClick}
      type="button"
    >
      <Icon />
      {option.label}
    </button>
  </li>
{/if}
