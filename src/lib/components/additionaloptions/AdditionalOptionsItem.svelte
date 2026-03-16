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
  <li class="not-last:border-b-whisper not-last:border-b-2">
    <button
      class="font-sansserif text-pastelPurple hover:text-daisyBush flex w-full cursor-pointer gap-x-2 p-4 font-bold"
      type="button"
      onclick={option.onclick}
    >
      {#if option.icon}
        <option.icon />
      {:else}
        <View />
      {/if}
      {option.label}
    </button>
  </li>
{/if}
