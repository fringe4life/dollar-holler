<script lang="ts">
  import View from "$lib/icon/View.svelte";
  import type { Component } from "svelte";
  import type { MouseEventHandler } from "svelte/elements";
  import type { IconProps } from "../Icon.svelte";

  export type Option = {
    label: string;
    icon?: Component<IconProps>;
    disabled: boolean;
    onclick: MouseEventHandler<HTMLButtonElement>;
  };

  type Props = {
    option: Option;
  };

  let { option }: Props = $props();
</script>

{#if !option.disabled}
  {@const Icon = option.icon || View}
  <li class="not-last:border-b-whisper not-last:border-b-2">
    <button
      class="font-sansserif text-pastelPurple hover:text-daisyBush flex cursor-pointer gap-x-2 p-4 font-bold transition-colors duration-200 inline-full"
      type="button"
      onclick={option.onclick}
    >
      <Icon />
      {option.label}
    </button>
  </li>
{/if}
