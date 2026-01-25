<script lang="ts">
  import View from "$lib/icon/View.svelte";
  import type { Component } from "svelte";
  import type { MouseEventHandler } from "svelte/elements";
  import type { IconProps } from "./Icon.svelte";

  type Option = {
    label: string;
    icon?: Component<IconProps>;
    disabled: boolean;
    onclick: MouseEventHandler<HTMLButtonElement>;
  };

  type Props = {
    options: Option[];
  };

  let { options }: Props = $props();
</script>

<ul class="absolute top-4 left-0 rounded-lg bg-white shadow-lg">
  {#each options as option (option.label)}
    {#if !option.disabled}
      <li>
        <button
          class="font-sansserif text-pastelPurple hover:text-daisyBush not-last:border-b-whisper flex w-full cursor-pointer gap-x-2 p-4 font-bold not-last:border-b-2"
          type="button"
          onclick={option.onclick}
        >
          <View />
          {#if option.icon}
            <option.icon />
          {/if}
          {option.label}
        </button>
      </li>
    {/if}
  {/each}
</ul>
