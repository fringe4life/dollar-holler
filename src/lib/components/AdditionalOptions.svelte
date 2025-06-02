<script lang="ts">
  import View from '$lib/icon/View.svelte'
  import type { Component, SvelteComponent } from 'svelte'
  import type { MouseEventHandler } from 'svelte/elements'

  type Props = {
    options: {
      label: string
      Icon?: (...args: any[]) => Component
      disabled: boolean
      onclick: MouseEventHandler<HTMLButtonElement>
    }[]
  }

  let { options }: Props = $props()
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
          {#if option.Icon}
            <option.Icon />
          {/if}
          {option.label}
        </button>
      </li>
    {/if}
  {/each}
</ul>
